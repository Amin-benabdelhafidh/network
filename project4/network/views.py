# Amin BenAbdelhafidh ............................. on Dec 26, 2022;
# .................. Github: https://github.com/Amin-benabdelhafidh;
# Github repository: https://github.com/Amin-benabdelhafidh/network;
# ........................................."Social Network" Project; 
import json
from rest_framework import status
from rest_framework.decorators import parser_classes
from rest_framework.response import Response
from rest_framework.parsers import JSONParser
from rest_framework.decorators import api_view
from django.contrib.auth import authenticate, login, logout
from django.db import IntegrityError
from django.http import HttpResponse, HttpResponseRedirect, JsonResponse
from .serializers import *
from django.shortcuts import render
from django.urls import reverse
from django.views.decorators.csrf import csrf_exempt, requires_csrf_token
from django.core.paginator import Paginator,  EmptyPage
from .models import (
    User,
    Post,
    Comment
)


def index(request):
    return render(request, 'network/index.html')



def login_view(request):
    if request.method == "POST":

        # Attempt to sign user in
        username = request.POST["username"]
        password = request.POST["password"]
        user = authenticate(request, username=username, password=password)

        # Check if authentication successful
        if user is not None:
            login(request, user)
            return HttpResponseRedirect(reverse("index"))
        else:
            return render(request, "network/login.html", {
                "message": "Invalid username and/or password."
            })
    else:
        return render(request, "network/login.html")



def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse("index"))



def register(request):
    if request.method == "POST":
        username = request.POST["username"]
        email = request.POST["email"]

        # Ensure password matches confirmation
        password = request.POST["password"]
        confirmation = request.POST["confirmation"]
        if password != confirmation:
            return render(request, "network/register.html", {
                "message": "Passwords must match."
            })

        # Attempt to create new user
        try:
            user = User.objects.create_user(username, email, password)
            user.save()
        except IntegrityError:
            return render(request, "network/register.html", {
                "message": "Username already taken."
            })
        login(request, user)
        return HttpResponseRedirect(reverse("index"))
    else:
        return render(request, "network/register.html")



@api_view(['GET'])
def loadAllPosts(request): 
    if request.method == 'GET':
        posts= Post.objects.all().order_by('-publish_time')
        pages = Paginator(posts, 10)
        try:
            current = pages.page(request.GET['page'])
        except EmptyPage:
            return Response({'message': 'no more pages.'})
        serializer = PostSerializer(current.object_list, many=True)
        return Response({
            'pages_num': pages.num_pages,
            'data': serializer.data,
        },status=200)
    return Response({'Error': 'something went wrong'})



@api_view(['GET'])
def loadFollowingPosts(request):
    if request.method == 'GET':
        user = User.objects.get(pk=int(request.GET['id']))
        posts= Post.objects.filter(user__in=user.followings.all()).order_by('-publish_time')
        pages = Paginator(posts, 10)
        try:
            current = pages.page(request.GET['page'])
        except EmptyPage:
            return Response({'message': 'no more pages.'})
        serializer = PostSerializer(current.object_list, many=True)
        return Response({
            'pages_num': pages.num_pages,
            'data': serializer.data,
        },status=200)



@api_view(['GET'])
def loadProfile(request, user, pk):
    if request.method == "GET":
        user_profile = User.objects.get(pk=pk, username=user)
        serializer = UserSerializer(user_profile)
        return Response({
            "user": serializer.data,
        }, status=200)



@api_view(["GET"])
def loadProfilePosts(request):
    if request.method == 'GET':
        posts= Post.objects.filter(user__id=request.GET['id']).order_by('-publish_time')
        pages = Paginator(posts, 10)
        try:
            current = pages.page(request.GET['page'])
        except EmptyPage:
            return Response({'message': 'no more pages.'})
        serializer = PostSerializer(current.object_list, many=True)
        return Response({
            'pages_num': pages.num_pages,
            'data': serializer.data,
        },status=200)



@csrf_exempt
@api_view(['POST', 'PUT', "DELETE"])
@parser_classes([JSONParser])
def create_editPost(request):
    if request.method == 'POST':
        data = request.data
        user = User.objects.get(pk=data.get('user', ""))
        content = data.get('content', "")
        post = Post(
            user=user,
            content=content
        )
        post.save()
        return Response(status=status.HTTP_201_CREATED)
    elif request.method == 'PUT':
        data = request.data
        content = data.get('content', "")
        post = Post.objects.filter(pk=data.get('post', "")).update(content=content)
        return Response(status=status.HTTP_200_OK)
    elif request.method == 'DELETE':
        data = request.data
        Post.objects.filter(pk=data.get('post', "")).delete()
        return Response(status=status.HTTP_200_OK)



@csrf_exempt
@api_view(['PUT', 'GET'])
@parser_classes([JSONParser])
def likePost(request):
    if request.method == 'PUT':
        data = request.data
        user = User.objects.get(pk=int(data.get('user', "")))
        post = Post.objects.get(pk=int(data.get('post', "")))
        if user in post.likes.all():
            post.likes.remove(user)
            post.save
        else:
            post.likes.add(user)
            post.save
        return Response({'message': 'success'},status=200)
    elif request.method == 'GET':
        post = Post.objects.get(pk=int(request.GET['post']))
        length = post.likes.all().count()
        return JsonResponse({'like_num': length})



@csrf_exempt
@api_view(['PUT'])
def follow(request):
    if request.method == 'PUT':
        data = request.data
        followed = User.objects.get(pk=data.get('followed', ''))
        follower = User.objects.get(pk=int(data.get('follower', '')))
        if follower in followed.followers.all():
            followed.followers.remove(follower)
            follower.followings.remove(followed)
            follower.save()
            followed.save()
        else:
            followed.followers.add(follower)
            follower.followings.add(followed)
            follower.save()
            followed.save()
        return Response(status=status.HTTP_200_OK)



@api_view(['GET'])
def getpost(request):
    if request.method == 'GET':
        post = Post.objects.get(pk=request.GET['id'])
        comments = Comment.objects.filter(commented_on=post).order_by('-commented_at')
        post_serializer = PostSerializer(post)
        comment_serializer = CommentSerializer(comments, many=True)
        return Response({'post': post_serializer.data, 'comments': comment_serializer.data}, status=status.HTTP_200_OK)



@api_view(['POST'])
def commentPost(request):
    if request.method == 'POST':
        data = request.data
        post = Post.objects.get(pk=data['pk'])
        user = User.objects.get(pk=data["user"])
        content = data['content']
        comment = Comment(
            user=user, 
            commented_on=post, 
            content=content,
        )
        comment.save()
        return Response(status=status.HTTP_200_OK)
