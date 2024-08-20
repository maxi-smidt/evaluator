from rest_framework import serializers
from ..models import Report


class ReportSerializer(serializers.ModelSerializer):
    class Meta:
        model = Report
        fields = '__all__'
        read_only_fields = ['submitter']

    def create(self, validated_data):
        request = self.context.get('request')
        user = request.user
        validated_data['submitter'] = user
        return super().create(validated_data)
