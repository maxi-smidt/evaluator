import json

from bs4 import BeautifulSoup
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from io import BytesIO
from ..models import Correction


class PDFMaker:
    @staticmethod
    def generate_pdf(correction: Correction):
        data = correction.draft
        pdf_stream = BytesIO()
        pdf = SimpleDocTemplate(filename=pdf_stream,
                                pagesize=A4,
                                rightMargin=50,
                                leftMargin=50,
                                topMargin=20,
                                bottomMargin=10)
        flowables = []

        styles = getSampleStyleSheet()

        styles.add(ParagraphStyle(name='exerciseHeading', fontSize=14, spaceAfter=10, leading=18))
        styles.add(ParagraphStyle(name='subExerciseHeading', fontSize=12, spaceAfter=6, leading=14))
        styles.add(ParagraphStyle(name='rightAlign', alignment=2, fontSize=10, spaceAfter=6, spaceBefore=6))
        styles.add(ParagraphStyle(name='name', spaceBefore=6, fontSize=10))
        styles.add(ParagraphStyle(name='points', fontWeight='Bold', spaceBefore=15, fontSize=12, spaceAfter=2))

        flowables.append(Paragraph('TODO changedate', styles['rightAlign']))
        flowables.append(Paragraph(f"{correction.assignment_instance.assignment.name}", styles['Title']))
        flowables.append(Paragraph(f"Tutor: {correction.tutor.full_name}", styles['name']))
        flowables.append(Paragraph(f"Student: {correction.student.full_name}", styles['name']))
        flowables.append(Paragraph(f"Points: {correction.points}", styles['points']))
        flowables.append(Spacer(1, 12))

        PDFMaker._create_annotations(data, flowables, styles)
        PDFMaker._create_exercises(data, flowables, styles)

        pdf.build(flowables)

        pdf_bytes = pdf_stream.getvalue()
        pdf_stream.close()
        return pdf_bytes

    @staticmethod
    def _create_annotations(data, flowables, styles):
        flowables.append(Paragraph(f"Anmerkungen", styles['exerciseHeading']))
        annotation_table = PDFMaker._create_notes_table(data['annotations'])
        flowables.append(annotation_table)
        flowables.append(Spacer(1, 12))

    @staticmethod
    def _create_exercises(data, flowables, styles):
        for exercise in data['exercise']:
            flowables.append(Paragraph(f"{exercise['name']}: 'TODO add points'", styles['exerciseHeading']))

            for sub_ev in exercise['sub']:
                flowables.append(Paragraph(f"{sub_ev['name']}: {sub_ev['points']}", styles['subExerciseHeading']))
                notes_table = PDFMaker._create_notes_table(sub_ev['notes'])
                flowables.append(notes_table)
                flowables.append(Spacer(1, 12))

    @staticmethod
    def _create_notes_table(notes):
        styles = getSampleStyleSheet()
        table_data = [['Anmerkung', 'Punkte']]
        for note in notes:
            table_data.append([Paragraph(PDFMaker._remove_class_attribute(note['text']), styles["BodyText"]), str(note['points']) if note['points'] <= 0 else f"+{note['points']}"])

        table = Table(table_data, colWidths=[460, 40])

        table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (1, 0), (1, -1), 'CENTER'),
            ('VALIGN', (1, 0), (1, -1), 'MIDDLE'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('BACKGROUND', (0, 1), (-1, -1), colors.rgb2cmyk(240, 240, 240)),
            ('GRID', (0, 0), (-1, -1), 1, colors.black)
        ]))
        return table

    @staticmethod
    def _remove_class_attribute(html_content):
        soup = BeautifulSoup(html_content, 'html.parser')
        for element in soup.findAll():
            del element['class']

        return str(soup)