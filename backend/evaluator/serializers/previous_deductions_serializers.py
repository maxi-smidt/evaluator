from rest_framework import serializers

from ..models import PreviousDeduction


class PreviousDeductionsSerializer(serializers.ModelSerializer):
    class Meta:
        model = PreviousDeduction
        fields = ['draft', 'id']


class PreviousDeductionsCreateSerializer(PreviousDeductionsSerializer):
    class Meta(PreviousDeductionsSerializer.Meta):
        fields = PreviousDeductionsSerializer.Meta.fields + ['assignment']