
from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),

    # API 
    path("allPosts", views.loadAllPosts, name="AllPosts"),
    path('followingPosts', views.loadFollowingPosts, name='followingPosts'),
    path('Profile/<int:pk>/<str:user>', views.loadProfile, name='profile'),
    path('UserPosts', views.loadProfilePosts, name='profile_posts'),
    path('follow', views.follow, name='follow'),
    path('createPost', views.create_editPost, name='post'),
    path('writeComment', views.commentPost, name='comment'),
    path('likePost', views.likePost, name='like'),
    path('Post', views.getpost, name='Getpost')
    
]
