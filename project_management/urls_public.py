"""
URL configuration for project_management project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.conf import settings
from django.urls import path, include
from tenant_manager.admin import tenant_admin_site
from debug_toolbar.toolbar import debug_toolbar_urls
from tenant_manager.views import TenantRegistrationView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('admin_tenants/', tenant_admin_site.urls),
    path('register/', TenantRegistrationView.as_view(), name='create_tenant'),
    path('tenants/', include('tenant_manager.urls'))
] + debug_toolbar_urls()
