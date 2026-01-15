"""
URL configuration for Mayor K. Guest Palace Hotel Management System.
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    # Admin site
    path('admin/', admin.site.urls),
    
    # API v1
    path('api/v1/', include('core.urls')),
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

# Customize admin site
admin.site.site_header = "Mayor K. Guest Palace"
admin.site.site_title = "Mayor K. Admin"
admin.site.index_title = "Hotel Management System"
