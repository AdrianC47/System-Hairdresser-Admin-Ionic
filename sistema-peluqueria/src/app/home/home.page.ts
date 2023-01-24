import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { getStorage, ref, getDownloadURL } from "firebase/storage";
import { UserService } from '../api/user.service';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { IonModal, IonContent, ToastController } from '@ionic/angular';
import { User } from '../entidades/User';
import { fromEvent, debounceTime } from 'rxjs';
import { OverlayEventDetail } from '@ionic/core/components';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {
  @ViewChild(IonModal) modal: IonModal;
  @ViewChild(IonContent) content: IonContent;
  usuarioAuxiliar: User;
  uploadedImage: File;
  userActualizado: User;
  message = 'This modal example uses triggers to automatically open a modal when the button is clicked.';
  updateUsuarioForm: FormGroup = this.fb.group({
    'id': ['', [Validators.required]],
    'username': ['', [Validators.required]],
    'password': ['', [Validators.required]],
  })



  constructor(private fb: FormBuilder, private router: Router,
    private toastController: ToastController, private userService: UserService, public storage: AngularFireStorage) { }

  async ngOnInit() {
    this.initUser();
    if (localStorage.getItem("UID") === null) {
      this.mostrarMensaje('!!Inicie Sesion!!');
      this.router.navigate(['/login'])
    } else {
      var usuario = localStorage.getItem("UID");
      await this.userService.getAuth().subscribe(auth => {
        if (auth) {//si el objeto auth existe entonces
          console.log(auth.email)
          this.usuarioAuxiliar.username = auth.email;
          this.getUserProfileImage(usuario)
          this.initUserUpdate()
        }
      })

    }
  }


  getUserProfileImage(uid: any) {
    var imagen;
    // Create a reference with an initial file path and name
    const storage = getStorage();
    getDownloadURL(ref(storage, 'Estilistas/' + uid))
      .then((url) => {

        // Or inserted into an <img> element
        const img = document.getElementById('imagen');
        img.setAttribute('src', url);

      })
      .catch((error) => {
        // Handle any errors
      });
    return imagen;
  }
  async   getUserProfileImageonUpdate() {
    var usuario = localStorage.getItem("UID");
 
    const storage = getStorage();
    const hola =  getDownloadURL(ref(storage, 'Estilistas/' + usuario))
      .then((url) => {
        // setTimeout(url, 3000)
        // Or inserted into an <img> element
        const img = document.getElementById('imagenonUpdate');
        img.setAttribute('src', url);

      })
      .catch((error) => {
        // Handle any errors
      });

  }


  onWillDismiss(event: Event) {
    const ev = event as CustomEvent<OverlayEventDetail<string>>;
    if (ev.detail.role === 'confirm') {
      this.message = `Hello, ${ev.detail.data}!`;
    }
  }

  initUser() {

    this.usuarioAuxiliar = {
      id: '',
      username: '',
      password: '',
      foto: '',
    };
  }
  initUserUpdate() {

    this.userActualizado = {
      id: '',
      username: '',
      password: '',
      foto: '',
    };
  }

  async mostrarMensaje(mensaje: any) {
    const toast = await this.toastController.create({
      position: 'top',
      message: mensaje,
      duration: 3000
    });
    toast.present();
  }
  async mostrarImagen(event: any) {

    if (event.target.files && event.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.userActualizado.foto = e.target.result;
        this.uploadedImage = event.target.files[0];
      };
      reader.readAsDataURL(event.target.files[0]);
    }
  }

  updateUser() {

  }


  CerrarSesion() {
    localStorage.clear();
    this.router.navigate(['/login']).then(() => {
      window.location.reload();
    });
  }
  cancel() {
    this.modal.dismiss(null, 'cancel');
  }
}
