from django.urls import path
from . import views

urlpatterns = [
    path("calendar", views.calendar),
    path("login", views.login),
    path("signup", views.signup),
    path("schedule", views.schedule),
    path("addpost", views.addpost),
    path("profile",views.profile),
    path("photo", views.photo),
    path("addphotopost", views.addphotopost),
    path("updatepost", views.updatepost),
    path("updateresult", views.updateresult),
    path("deletepost", views.deletepost),
]