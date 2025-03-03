from . import models
from rest_framework import serializers
from rest_framework.validators import UniqueValidator

class TenantSerializer(serializers.ModelSerializer):
    name =  serializers.CharField(max_length=255)
    paid_until = serializers.DateField()
    on_trail = serializers.BooleanField()
    
    class Meta:
        model = models.Tenant
        fields = ['id', 'schema_name', 'name', 'created_on', 'paid_until', 'on_trail']
        read_only_fields = ['id', 'created_on']

    def validate_schema_name(self, value):
        # Construct the domain name from the provided schema name
        request = self.context.get('request')
        if request:
            hostname = request.get_host()
            if "localhost" in hostname:
                hostname = "localhost"
        else:
            hostname = "localhost"  

        domain_name = f"{value}.{hostname}"
        # Check if the domain already exists
        if models.Domain.objects.filter(domain=domain_name).exists():
            raise serializers.ValidationError("The domain is not available.")
        
        self.domain_name = domain_name
        return value
    
    def create(self, validated_data):
        tenant = models.Tenant.objects.create(**validated_data)
       
        models.Domain.objects.create(
            tenant=tenant,
            domain=self.domain_name,
            is_primary=True
        )
        return tenant, self.domain_name
        
# class DomainSerializer(serializers.ModelSerializer):
#     domain = serializers.CharField(
#         validators=[UniqueValidator(queryset=models.Domain.objects.all())]
#     )
#     class Meta:
#         models = models.Domain
#         fields = ['id', 'domain', 'is_primary', 'tenant']
#         read_only_fields = ['id', 'is_primary']