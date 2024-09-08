from rest_framework import serializers

from evaluator.models import PreviousDeduction


class PreviousDeductionsSerializer(serializers.ModelSerializer):
    class Meta:
        model = PreviousDeduction
        fields = ['draft']