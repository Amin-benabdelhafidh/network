// Amin BenAbdelhafidh ............................. on Dec 26, 2022;
// .................. Github: https://github.com/Amin-benabdelhafidh;
// Github repository: https://github.com/Amin-benabdelhafidh/network;
// ........................................."Social Network" Project; 

// main program
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('Post_manage').style.display = 'none';
    document.getElementById('posts').style.display = 'block';
    loadSpeceficPage('allPosts', 1);
    paginator('allPosts');
    try{
        document.querySelector('#profile').addEventListener('click', () => {
        const data = document.getElementById('profile').getAttribute('data-informations').split(';');
        loadProfile(data[1], data[0]);
        loadProfilePosts(1, data[1]);
        paginator('profile', data[1]);
        
    });
    } catch(error){
        throw ':user is not signed in (can not load profile)';
    }
    document.querySelector('#allPosts').addEventListener('click', () => { 
        loadAllPosts(1, true);
        paginator('allPosts');
    })
    try{document.querySelector('#following-posts').addEventListener('click', () =>{
        loadFollowingPosts(1);
        paginator('following');
    });
    } catch(error){
        throw ": user is not signed in (can not load following posts)";
    }
    try{document.querySelector('#add-post').addEventListener('click', () => {
        add_Post();
    });
    } catch(error){
        throw ": user is not signed in (can not add post)";
    }
});


const paginator = (type, id)=>{
    let next = document.querySelector('#next');
    let previous = document.querySelector('#previous');
    let current=1;
    let pages;

    if(type === 'allPosts'){
        // get the number of pages of all-posts and call the paginator func with the number
        fetch(`/allPosts?page=${current}`)
        .then(response => response.json())
        .then(data => {
            pages = data['pages_num']
        })
        .catch(error => console.log(error))

    } else if(type === 'following'){
        // get the number of pages of following-posts and call the paginator func with the number
        fetch(`/followingPosts?page=${current}&id=${document.getElementById('profile').getAttribute('data-informations').split(';')[1]}`)
        .then(response => response.json())
        .then(data => {
            pages = data['pages_num']
        })
        .catch(error => console.log(error))

    } else if(type === 'profile'){
        // get the numeber of pages of profile-posts and call the paginator func with the number 
        fetch(`/UserPosts?page=${current}&id=${id}`)
        .then(response => response.json())
        .then(data => {
            pages = data['pages_num']
        })
        .catch(error => console.log(error))
    }
    change_page(current, pages)
    
    previous.addEventListener('click', ()=>{
        if(current > 1){
            current--;
            change_page(current, pages)
            loadSpeceficPage(type, current, id)
        }
    })

    next.addEventListener('click', ()=>{
        if(current < pages){
            current++;
            change_page(current, pages)
            loadSpeceficPage(type, current, id)
        }
    })  
}


const change_page = (current_page, pages) => {
    let previous = document.querySelector('#previous');
    if (current_page === 1) {
        previous.style.visibility = "hidden";
    } else {
        previous.style.visibility = "visible";
    }

    let next = document.querySelector('#next');
    if (current_page === pages) {
        next.style.visibility = "hidden";
    } else {
        next.style.visibility = "visible";
    }
}


const loadSpeceficPage = (type, page, id) =>{
    if(type === 'allPosts'){
        loadAllPosts(page);
    } else if(type === 'following'){
        loadFollowingPosts(page);
    } else{
        loadProfilePosts(page, id);
    }
}


// function that loads all-posts and it will be called in the loadSpeceficPage func
const loadAllPosts = (num, back_to_AP) =>{
    document.getElementById('Post_manage').style.display = 'none';
    document.getElementById('the-post').style.display = 'none';
    document.getElementById('posts').style.display = 'block';
    fetch(`/allPosts?page=${num}`)
    .then(response => response.json())
    .then(data => {

        loadPosts(data['data'])
        if(back_to_AP){
            document.getElementById('profile-informations-container').style.display = 'none';
        }
    })
}


// function that loads following-posts of a specefic user and it will be also called in the loadSpeceficPage func
const loadFollowingPosts = (num)=>{
    document.getElementById('Post_manage').style.display = 'none';
    document.getElementById('profile-informations-container').style.display = 'none';
    document.getElementById('the-post').style.display = 'none';
    document.getElementById('posts').style.display = 'block';
    
    fetch(`/followingPosts?page=${num}&id=${document.getElementById('profile').getAttribute('data-informations').split(';')[1]}`)
    .then(response => response.json())
    .then(data => {

        loadPosts(data['data'])
        
    })
}


//this function loads profile posts;
const loadProfilePosts = (page, id) =>{
    fetch(`/UserPosts?page=${page}&id=${id}`)
    .then(response => response.json())
    .then(data => {
        loadPosts(data['data'])
    })
}


// this function loads posts by just calling it and passin' in it the data of posts you need to load;
const loadPosts = (data) => {
    // remove any post from previous page
    let elems = document.querySelectorAll('.post');
    elems.forEach(element => {
        element.parentNode.removeChild(element);
    })  

    // load Post  
    data.forEach(element => {
        // creating elements

        const post = document.createElement('div');

        post.setAttribute('class', 'post');
        post.setAttribute('data-id', `${element.id}`);
        post.setAttribute('data-user', `${element.user}`);

        let hr = document.createElement('hr');
        let hr_t = document.createElement('hr');
        let username = document.createElement('h4');
        let content = document.createElement('p');
        let likes = document.createElement('h6');
        let like_button = document.createElement('i');
        let comments = document.createElement('h6');

        comments.addEventListener('click', ()=>{
            load_Single_Post(element.id, element.user);
        })

        like_button.setAttribute('class', "bi bi-heart inline");


        // give them their values;
        username.innerHTML = element.username;
        // handle click event for the username;
        username.addEventListener('click', () =>{

            loadProfile(element.user, username.textContent);
            loadProfilePosts(1, post.getAttribute('data-id'));
            paginator('profile', post.getAttribute('data-id'));
            
        })

        content.innerHTML = element.content.split('\n').join("<br>");
        likes.innerHTML = element.likes.length;
        comments.innerHTML = 'comments';

        // set class attribute to these created elements;
        for(let i in element.likes){
            if(parseInt(data[1]) === element.likes[i]){
                like_button.setAttribute('class', "bi bi-heart-fill inline");
              break
            }
        }

        hr.setAttribute('class', 'hr_element');
        hr_t.setAttribute('class', 'hr_element');
        likes.setAttribute('class', 'likes inline');
        username.setAttribute('class', 'username inline');
        content.setAttribute('class', 'content');
        comments.setAttribute('class', 'block load-cmnts');

        
        // enable the user to edit and delete the post;
        try{
            let data_ = document.getElementById('profile').getAttribute('data-informations').split(';');
        if(post.getAttribute("data-user") === data_[1]){ 
            // creating Elements;
            let ED_container = document.createElement('div');
            let ED = document.createElement('div');
            let edit = document.createElement('input');
            let del = document.createElement('input');
            // set attributes;
            ED_container.setAttribute('class', 'EDcontainer');
            edit.setAttribute('class', 'ED inline');
            edit.setAttribute('type', 'button');
            del.setAttribute('class', 'ED inline');
            del.setAttribute('type', 'button');
            // set values;
            edit.value = 'Edit';
            del.value = 'Delete';
            // append Elements;
            ED.append(edit);
            ED.append(del);
            ED_container.append(username);// <-- addin' the username here for easy stylin' later;
            ED_container.append(ED);
            // append div;
            post.append(ED_container);
            edit.addEventListener('click', () => edit_post(element.id));
            del.addEventListener('click', () => {
                delete_post(element.id);
                document.getElementById('Post_manage').style.display = 'none';
                document.getElementById('profile-informations-container').style.display = 'none';
                document.getElementById('the-post').style.display = 'none';
                document.getElementById('posts').style.display = 'block';
            });
        } else {
            post.append(username);
        }
            // listen to like button 
        like_button.addEventListener('click', () =>{
            fetch('/likePost', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': getCookie('csrftoken')
                },
                body: JSON.stringify({
                    user: data_[1],
                    post: post.getAttribute('data-id')
                }) 
            })
            .then(response => response.json())
            .then(result => {
                // this will make the user able to toggle between 'LIKE' and 'UNLIKE';
                switch (like_button.getAttribute('class')) {
                    case 'bi bi-heart-fill inline':
                        like_button.setAttribute('class' , 'bi bi-heart inline');
                      break;
                    case 'bi bi-heart inline':
                        like_button.setAttribute('class' , 'bi bi-heart-fill inline');
                      break;
                }
                // the code below will get the number of likes in the post;
                const postid = post.getAttribute('data-id')
                fetch(`/likePost?post=${postid}`)
                .then(respose => respose.json())
                .then(data => {
                    likes.innerHTML = data['like_num']
                })
                .catch(error => console.log(error))
                     
            })
            .catch(error => console.log(error))
        })    
        } catch(error){
            post.append(username);
        }

        // add elements to their parent(except 'username');
        post.append(hr);
        post.append(content);
        post.append(hr_t);
        post.append(like_button);
        post.append(likes);
        
        post.append(comments);

        
        
        // add the post to the post container
        document.getElementById('posts').append(post)
    });  
}


// load profile informations
const loadProfile = (user_id, username) =>{
    let data_ = document.getElementById('profile').getAttribute('data-informations').split(';');

    fetch(`Profile/${user_id}/${username}`)
    .then(response => response.json())
    .then(data => {
        let elems = document.querySelectorAll('.follow_button');
        elems.forEach(element => {
            element.parentNode.removeChild(element);
        })  
        document.querySelector('#username-profile').innerHTML = data.user.username;
        document.querySelector('#followings').innerHTML = data.user.followings.length;
        document.querySelector('#followers').innerHTML = data.user.followers.length;
        if(data_[1] != data.user.id){
            let follow_button = document.createElement('button');
            follow_button.setAttribute("id", 'follow_button');
            follow_button.setAttribute('class', 'btn btn-primary block follow_button');
            follow_button.innerHTML = 'Follow';
            for(let i in data.user.followers){
                if(data.user.followers[i] == data_[1]){
                    follow_button.innerHTML = 'Unfollow';
                }
            }
            
            document.getElementById('follow-section').append(follow_button);
            follow_button.addEventListener('click', () =>{
                follow(data.user.id, data_[1]);
                // change follow_button text content;
                switch(follow_button.textContent){
                    case "Unfollow":
                        setTimeout(()=>{follow_button.innerHTML = "Follow"}, 500)
                        break;
                    case "Follow":
                        setTimeout(()=>{follow_button.innerHTML = "Unfollow"}, 500)
                        break;
                }
                // update followings and followers number;
                setTimeout(()=>{
                    fetch(`Profile/${user_id}/${username}`)
                    .then(response => response.json())
                    .then(da => {
                        document.querySelector('#followings').innerHTML = da.user.followings.length;
                        document.querySelector('#followers').innerHTML = da.user.followers.length;
                    })
                }, 500)
                
            })  
        }

        document.getElementById('Post_manage').style.display = 'none';
        document.getElementById('profile-informations-container').style.display = 'block';

        loadProfilePosts(1, user_id);
        paginator('profile', user_id)
    })
    .catch(error => error)
}


// follow or unfollow user
const follow = (f_user,user) =>{
    fetch(`/follow`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCookie('csrftoken'),
        },
        body: JSON.stringify({
            followed: f_user,
            follower: user,
        })
    })
}


// function: send the content of the post that user wants to share 
const add_Post = () => {
    document.getElementById('the-post').style.display = 'none';
    document.getElementById('Post_manage').style.display = 'block';
    document.getElementById('profile-informations-container').style.display = 'none';
    document.getElementById('posts').style.display = 'none';
    
    document.getElementById('post-form').addEventListener('submit', () => {
        let area = document.getElementById('post-content');
        const cont = area.value;

        // check if the textarea is empty;
        if (cont == '') return false;

        // reset the text area to null
        area.value = ''
        const data = document.getElementById('profile').getAttribute('data-informations').split(';');
        
        // send form data to make a post
        fetch('/createPost', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCookie('csrftoken'),
            },
            body: JSON.stringify({
                content: cont,
                user: data[1],
            })
        })
       
        // quit the add-post page and return back to all posts;
        loadAllPosts(1);
        paginator('allPosts');

        return false;

    })
}


// edit post;
const edit_post = (id) => {
    let element = document.getElementById('post-content');
    fetch(`/Post?id=${id}`)
    .then(response => response.json())
    .then(result => {
        element.innerHTML = result.post.content;
        document.getElementById('the-post').style.display = 'none';
        document.getElementById('Post_manage').style.display = 'block';
        document.getElementById('profile-informations-container').style.display = 'none';
        document.getElementById('posts').style.display = 'none';
    })
    .catch(error => error);

    // submit the changes;
    document.getElementById('submit-post').addEventListener('click', () => {
        fetch('/createPost', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCookie('csrftoken'),
            },
            body: JSON.stringify({
                content: element.value,
                post: id,
            })
        })
        loadAllPosts(1);
        paginator('allPosts');
        return true;
    })
} 


// delete post;
const delete_post = (id) => {
    fetch("/createPost", {
        method: "DELETE",
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCookie('csrftoken'),
        },
        body: JSON.stringify({
            post: id,
        })
    })
    .then(result =>{
        loadAllPosts(1);
        paginator('allPosts');
    }
        
    )
    return true;
}


// this function loads a single post
const load_Single_Post = (id, user) =>{

    // clear the comment container;
    let elems = document.querySelectorAll('.comment');
    elems.forEach(element => {
        element.parentNode.removeChild(element);
    })
    document.querySelectorAll(".ED").forEach(element => {
        element.parentNode.removeChild(element);
    })
    

    let data_ = document.getElementById('profile').getAttribute('data-informations').split(';');

    document.getElementById('posts').style.display = 'none';
    let thePost = document.getElementById('the-post')
    fetch(`/Post?id=${id}`)
    .then(result => result.json())
    .then(data => {

        const post_data = data['post']
        document.getElementById('post-username').innerHTML = post_data.username;  
        document.getElementById('s-post-content').innerHTML = post_data.content;
        
        let like_button = document.getElementById('post-like-icon');
        let likes = document.getElementById('post-like-number');
        likes.innerHTML = post_data.likes.length;
        like_button.setAttribute('class', "bi bi-heart inline")
        for(let i in data.post.likes){
            if(parseInt(data_[1]) === data.post.likes[i]){
                like_button.setAttribute('class', "bi bi-heart-fill inline")
                break
            }
        }
       
        // listen to like button 
        like_button.addEventListener('click', () =>{
            fetch('/likePost', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': getCookie('csrftoken')
                },
                body: JSON.stringify({
                    user: data_[1],
                    post: id
                }) 
            })
            .then(response => response.json())
            .then(result => {
                // this will make the user able to toggle between 'LIKE' and 'UNLIKE';
                switch (like_button.getAttribute('class')) {
                    case 'bi bi-heart-fill inline':
                        like_button.setAttribute('class' , 'bi bi-heart inline');
                      break;
                    case 'bi bi-heart inline':
                        like_button.setAttribute('class' , 'bi bi-heart-fill inline');
                      break;
                }
                // the code below will get the number of likes in the post;

                fetch(`/likePost?post=${id}`)
                .then(respose => respose.json())
                .then(data => {
                    likes.innerHTML = data['like_num']
                })
                .catch(error => console.log(error))
                     
            })
            .catch(error => console.log(error))
        })

        // load comments of the post;
        update_comments(data['comments']);
        if(user == data_[1]){
            let edit = document.createElement('input');
            let del = document.createElement('input');

            edit.setAttribute('class', 'ED inline');
            edit.setAttribute('type', 'button');
            del.setAttribute('class', 'ED inline');
            del.setAttribute('type', 'button');
            // set values;
            edit.value = 'Edit';
            del.value = 'Delete';


            // add functionality to the edit button;
            edit.addEventListener('click', () => edit_post(data.post.id));
            // add functionality to the delete button;
            del.addEventListener('click', () => delete_post(data.post.id));

            document.getElementById("ED-input").append(edit);
            document.getElementById("ED-input").append(del);
        }
        

        // display the page after the content has been; 
        thePost.style.display= 'block';

        // add event listener to comment form ;
        document.getElementById('submit-comment').addEventListener('click', () => {
            writeComment(post_data.id, data_[1]);
            setTimeout(()=>{
                fetch(`/Post?id=${id}`)
                .then(result => result.json())
                .then(new_cmnts => {
                    update_comments(new_cmnts.comments);
                })
                .catch(error => console.log(error));
            }, 1500);  
        })
    })
}


// this function will enable the user to write comments on a specefic post;
const writeComment = (id, user) => {
    // get control of the textarea of the comment;
    let comment_content = document.getElementById('comment');

    // check if the comment is empty;
    if(comment_content.value == '') return false;
    // send the comment to the server;
    fetch('/writeComment', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCookie('csrftoken')
        },
        body: JSON.stringify({
            pk: id,
            user: user,
            content: comment_content.value,
        }) 
    })

    comment_content.value = '';
    return false;

}


// this function loads and update comments of a post;
const update_comments = (data) => {
    let elems = document.querySelectorAll('.comment');
    elems.forEach(element => {
        element.parentNode.removeChild(element);
    })

    let comments_area = document.getElementById('comments');

    for(let i of data){
        let comment = document.createElement('p');
        let username = document.createElement('h6');
        let comment_cont = document.createElement('div');

        username.innerHTML = i['username'];
        comment.innerHTML = i['content'];

        comment_cont.append(username);
        comment_cont.append(comment);
        comment_cont.setAttribute('class', 'comment')
        comments_area.append(comment_cont);
    }
}


// this func is used to get cookies
const getCookie = (cname) => {
    let name = cname + "=";
    let decodedCookie = decodeURIComponent(document.cookie);
    let ca = decodedCookie.split(';');
    for(let i = 0; i <ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) == ' ') {
        c = c.substring(1);
      }
      if (c.indexOf(name) == 0) {
        return c.substring(name.length, c.length);
      }
    }
    return "";
}

