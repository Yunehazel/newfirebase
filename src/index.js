import { initializeApp } from "firebase/app";
import {firebaseConfig} from "../library/firebaseConfig.js" ;
import { getDatabase, ref ,onValue ,set, push ,remove ,update} from "firebase/database";
import { deleteObject, getDownloadURL, getStorage , ref as imageRef , uploadBytes} from "firebase/storage";

const app = initializeApp(firebaseConfig);
const db = getDatabase(app) ;
const storage = getStorage(app) ;

const userRef = ref(db, "users") ;
onValue(userRef, (snapshot) =>{
    const data = snapshot.val() ;
    if(data){
        const userList = Object.keys(data).map(userId => ({
            id : userId ,
            ...data[userId] ,
        })) ;
        console.log(userList) ;
        loadUserTable(userList) ;
    } else{
        document.getElementById("customers").innerHTML = "";
    }
})

function loadUserTable(users){
    let table = document.getElementById("customers") ;
    table.innerHTML = "" ;
    table.innerHTML = template_users_th() ;
    for(const user of users){
        table.innerHTML += template_users(user.name, user.gender, user.age, user.country, user.id,user.url,user.image_name) ;
    } ;
    addEventListener() ;
}

function createUser(){
    const name = document.getElementById('fname').value ;
    const age = document.getElementById('age').value ;
    const gender = document.getElementById('gender').value ;
    const country = document.getElementById('country').value ;
    const profile = document.getElementById('profile') ;
    if(profile.files.length > 0){
        const stroageRef = imageRef(storage ,"images/" + profile.files[0].name) ;
        const image_name = profile.files[0].name ;
        uploadBytes(stroageRef, profile.files[0]) .then((snapshot) =>{
            getDownloadURL(snapshot.ref).then(url =>{
                const data = {
                    name : name,
                    age : age,
                    gender : gender,
                    country : country,
                    url : url,
                    image_name : image_name,
                } ;
                const userRef  = push(ref(db , "users")) ;
                set(userRef ,data)
            })
        })
    }
}

function delete_user(id, url){
    const delete_user_ref = ref(db, 'users/' + id) ;
    const delete_user_image_ref = imageRef(storage , 'images/' + url) ;
    remove(delete_user_ref).then(() =>{
        deleteObject(delete_user_image_ref) ;
    })
}

function addEventListener(){
    const deleteButtons  = document.querySelectorAll('.delete-btn') ;
    deleteButtons.forEach(button => {
        button.addEventListener('click' , function (){
            const userId = this.dataset.userId ;
            const imageurl = this.dataset.userUrl ;
            delete_user( userId , imageurl) ;
        })
    }) ;

    const updateButtons = document.querySelectorAll('.update-btn') ;
    updateButtons.forEach(button => { 
        button.addEventListener('click' , function (){
            const userId = this.dataset.userId ;
            update_user_bind(userId) ;
        })
    })
} ;

function update_user_bind(id){
    let userRef = ref(db , 'users/' + id) ;
    onValue(userRef , (snapshot) => {
        console.log(snapshot.val()) ;
        const data = snapshot.val() ;
        document.getElementById('upd_name').value = data.name ;
        document.getElementById('upd_age').value = data.age ;
        document.getElementById('upd_gender').value = data.gender ;
        document.getElementById('upd_country').value = data.country ;
        document.getElementById('upd_id').value = id;
    })
    document.getElementById('myModal').style.display = 'block' ;
}


document.getElementsByClassName('close')[0].onclick = function(){
    document.getElementById('myModal').style.display = 'none' ;
} ;

document.getElementById('updateUser').addEventListener('click', update_user);


function update_user(){
    let id = document.getElementById('upd_id').value ;
    if(id){
        const updateRef = ref(db , 'users/' + id)
        let name = document.getElementById('upd_name').value ;
        let age = document.getElementById('upd_age').value ;
        let gender = document.getElementById('upd_gender').value ;
        let country = document.getElementById('upd_country').value ;
        const data = {name,age,gender,country} ;
        update(updateRef , data)
        .then(()=> console.log("successfully updated"))
        .catch(() => console.error("error update user"))
      
        } 
        document.getElementById('myModal').style.display = 'none' ;
}
function template_users(name, gender, age, country, id,img_url,img_name) {
    return `<tr>
    <td><img src=${img_url} class="profile_img"/> </td>
    <td>${name}</td>
    <td>${gender}</td>
    <td>${age}</td>
    <td>${country}</td>
    <td><button class="delete-btn" data-user-id="${id}" data-user-url="${img_name}">Delete</button></td>
    <td><button class="update-btn" data-user-id="${id}" >Update</button></td>
  </tr>`;
}

function template_users_th() {
    return `<tr>
    <th>Profile</th>
    <th>Name</th>
    <th>Gender</th>
    <th>Age</th>
    <th>Country</th>
    <th>Delete</th>
    <th>Update</th>
  </tr>`;
}

document.getElementById("saveUser").addEventListener("click", createUser);