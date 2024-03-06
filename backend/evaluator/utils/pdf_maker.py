from io import BytesIO
from weasyprint import HTML, CSS
from yattag import Doc
from datetime import datetime
from ..models import Correction


class PdfMaker:
    t_header = ['Anmerkung', 'Punkte']
    css = CSS(string='''
        @page { size: A4; margin: 1.5cm; }
        body { font-family: Arial, sans-serif;}
        header p {font-size: 16px; font-weight: 400; }
        header h1 { font-size: 32px; text-align: center; }
        .date { position: absolute; top: -35px; right: -10px; font-size: 14px; }
        .points { font-weight: 500; font-size: 17px; }
        body { margin-top: 30px; }
        body h3 { font-size: 19px; margin-bottom: 5px;}
        body h4 { margin-top: 10px; margin-bottom: 5px; }
        table { width: 100%; border-collapse: collapse; border: 1px solid #000;}
        th, td { border: 1px solid #000; padding: 10px; font-size: 14px; }
        th { background-color: #f2f2f2; padding: 5px 10px; font-size: 14px; }
        td { padding: 2px 2px; }
        td p { margin: 2px; }
        .td-points { text-align: center; }
        .td-text { padding-left: 7px; }
        td ol { margin-bottom: 0;  margin-top: 0; }
        th:first-child { width: 90%; }
        th:nth-child(2) { width: 10%; }
    ''')

    def __init__(self, correction: Correction):
        self.assignment = correction.assignment_instance.assignment.name
        self.tutor = correction.tutor.full_name
        self.student = correction.student.full_name
        self.date = datetime.now().strftime('%d.%m.%Y')
        self.points = float(correction.points)
        self.draft = correction.draft

    def make_header(self):
        doc, tag, text = Doc().tagtext()
        with tag('header'):
            with tag('h1'):
                text(self.assignment)
            with tag('p', klass='date'):
                text(self.date)
            with tag('p'):
                text('Tutor: ', self.tutor)
            with tag('p'):
                text('Student: ', self.student)
            with tag('p', klass='points'):
                text('Points: ', self.points)
        return doc.getvalue()

    def make_body(self):
        doc, tag, text = Doc().tagtext()
        with tag('div', klass='exercises'):
            doc.asis(self.make_annotations(self.draft['annotations']))
            doc.asis(self.make_exercises(self.draft['exercise']))

        return doc.getvalue()

    def make_annotations(self, annotations):
        doc, tag, text = Doc().tagtext()
        with tag('h3'):
            text('Anmerkungen')
        with tag('div'):
            doc.asis(self.make_table(annotations))
        return doc.getvalue()

    def make_exercises(self, exercises):
        doc, tag, text = Doc().tagtext()
        for exercise in exercises:
            with tag('h3'):
                text(f'{exercise["name"]}: {self.calculate_exercise_points(exercise)}')
            with tag('div'):
                for sub in exercise['sub']:
                    doc.asis(self.make_sub_exercise(sub))
        return doc.getvalue()

    def make_sub_exercise(self, sub_exercise):
        doc, tag, text = Doc().tagtext()
        with tag('h4'):
            text(f'{sub_exercise["name"]}: {self.calculate_sub_exercise_points(sub_exercise)}/{sub_exercise["points"]}')
        with tag('div'):
            doc.asis(self.make_table(sub_exercise['notes']))
        return doc.getvalue()

    def make_table(self, data):
        doc, tag, text = Doc().tagtext()
        with tag('table', klass='table'):
            with tag('thead'):
                with tag('tr'):
                    for header in self.t_header:
                        with tag('th'):
                            text(header)
            with tag('tbody'):
                for row in data:
                    with tag('tr'):
                        with tag('td', klass='td-text'):
                            doc.asis(row['text'])
                        with tag('td', klass='td-points'):
                            doc.asis(self.__convert_points(row['points']))
        return doc.getvalue()

    def make_html(self):
        doc, tag, text = Doc().tagtext()
        with tag('html'):
            with tag('head'):
                doc.stag('meta', charset='UTF-8')
            with tag('body'):
                doc.asis(self.make_header())
                doc.asis(self.make_body())
        return doc.getvalue()

    def make_pdf_stream(self):
        html = HTML(string=self.make_html())
        pdf_buffer = BytesIO()
        html.write_pdf(pdf_buffer, stylesheets=[self.css])
        pdf = pdf_buffer.getvalue()
        pdf_buffer.close()
        return pdf

    @staticmethod
    def __convert_points(points):
        return str(points) if points <= 0 else f'+{points}'

    @staticmethod
    def calculate_exercise_points(exercise):
        total, points_max = 0, 0
        for sub in exercise['sub']:
            points_max += sub['points']
            total += sub['points']
            for note in sub['notes']:
                total += note['points']
        return f'{total}/{points_max}'

    @staticmethod
    def calculate_sub_exercise_points(sub_exercise):
        return sub_exercise['points'] + sum(note['points'] for note in sub_exercise['notes'])
