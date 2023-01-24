import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { getStorage, ref, getDownloadURL } from "firebase/storage";
import { UserService } from '../api/user.service';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { IonModal, IonContent, ToastController } from '@ionic/angular';
import { User } from '../entidades/User';
import { fromEvent, debounceTime } from 'rxjs';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {
  @ViewChild(IonModal) modal: IonModal;
  @ViewChild(IonContent) content: IonContent;
  usuarioAuxiliar: User;
  uploadedImage: File ;
 


  constructor(private fb: FormBuilder, private router: Router,
    private toastController: ToastController, private userService: UserService,public storage: AngularFireStorage) { }

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
        }
      })
    //  await this.userService.getByUID(usuario).subscribe(res=> {
    //     this.usuarioAuxiliar.foto=res.
    //  })

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


  initUser() {

    this.usuarioAuxiliar = {
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
  CerrarSesion() {
    localStorage.clear();
    this.router.navigate(['/login']).then(() => {
      window.location.reload();
    });
  }
}
