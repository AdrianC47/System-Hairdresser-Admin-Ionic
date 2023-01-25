import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { getStorage, ref, getDownloadURL } from "firebase/storage";
import { UserService } from '../api/user.service';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { IonModal, IonContent, ToastController } from '@ionic/angular';
import { User } from '../entidades/User';
import { delay, finalize } from 'rxjs/operators';
import { AngularFireAuth } from "@angular/fire/compat/auth";
import { OverlayEventDetail } from '@ionic/core/components';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Perfil } from '../Perfil.enum';


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

    'username': ['', [Validators.required]],
    'password': ['', [Validators.required]],
    // 'foto': ['', [Validators.required]],
    'nombre': ['', [Validators.required]],
    'cedula': ['', [Validators.required]],
    'telefono': ['', [Validators.required]],
    'perfil': ['', [Validators.required]],

  })



  constructor(
    private fb: FormBuilder,
    private router: Router,
    private toastController: ToastController,
    private userService: UserService, private authService: AngularFireAuth,
    private db: AngularFirestore,
    public storage: AngularFireStorage) { }

  async ngOnInit() {
    this.initUser();
    if (localStorage.getItem("UID") === null) {
      this.mostrarMensaje('!!Inicie Sesion!!');
      this.router.navigate(['/login'])
    } else {
      var usuario = localStorage.getItem("UID");
      this.userService.getAuth().subscribe(async auth => {
        if (auth) {//si el objeto auth existe entonces 
          this.usuarioAuxiliar.username = auth.email;
          this.userService.getById(usuario).subscribe(res => {
            this.usuarioAuxiliar.nombre = res.nombre;
            this.usuarioAuxiliar.cedula = res.cedula;
            this.usuarioAuxiliar.telefono = res.telefono;
            this.usuarioAuxiliar.perfil = res.perfil;
          })

          this.usuarioAuxiliar.id = usuario

          await this.getUserProfileImage(usuario)
          this.initUserUpdate()
        }
      })

    }
  }

  async metodo() {
    var usuario = localStorage.getItem("UID");

    await this.userService.getById(usuario).subscribe(user => {
      this.usuarioAuxiliar = user;
      console.log(user.username)
      this.getUserProfileImageonUpdate()
    })


    return true;
  }


  async getUserProfileImage(uid: any) {
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
        this.mostrarMensaje(error)
      });
    return imagen;
  }


  getUserProfileImageonUpdate() {
    var usuario = localStorage.getItem("UID");

    const storage = getStorage();
    const hola = getDownloadURL(ref(storage, 'Estilistas/' + usuario))
      .then((url) => {

        const img = document.getElementById('imagenonUpdate');
        img.setAttribute('src', url);

      })
      .catch((error) => {

      });

  }


  onWillDismiss(event: Event) {
    const ev = event as CustomEvent<OverlayEventDetail<string>>;
    if (ev.detail.role === 'confirm') {
      this.message = `Hello, ${ev.detail.data}!`;

    }
  }


  mostrarImagen(event: any) {

    if (event.target.files && event.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.userActualizado.foto = e.target.result;
        this.usuarioAuxiliar.foto = e.target.result;
        this.uploadedImage = event.target.files[0];
      };
      reader.readAsDataURL(event.target.files[0]);
    }
  }

  async updateUser() {
    if (!this.updateUsuarioForm.valid) {

      return false;
    } else {

      // this.usuarioAuxiliar.foto = this.updateUsuarioForm.get("foto").value
      // this.userService.updateinAuth(this.usuarioAuxiliar, this.usuarioAuxiliar.id)
      // this.userService.updateinDB(usuario, this.usuarioAuxiliar.id) 
      const path = "Estilistas";
      const name = this.usuarioAuxiliar.id;
      const file = this.uploadedImage;
      const res = await this.userService.uploadImage(file, path, name);

      this.usuarioAuxiliar.foto = res;

      this.userActualizado.foto = res;
      this.userService.update(this.usuarioAuxiliar.id, this.updateUsuarioForm.value).then(() => {
      this.mostrarMensaje('Estilista actualizado exitosamente!')

        this.router.navigate(['/home']).then(() => {
          window.location.reload();
        });

        this.updateUsuarioForm.reset();

      });


    }
    return true;
  }


  subirImagen(file: any, path: string, nombre: string): Promise<string> {
    return new Promise(resolve => {


      const filePath = path + '/' + nombre;
      const ref = this.storage.ref(filePath);
      const task = ref.put(file);
      task.snapshotChanges().pipe(
        finalize(() => {
          ref.getDownloadURL().subscribe(res => {
            const downloadURL = res;
            resolve(downloadURL);
            return;
          });
        })
      )
        .subscribe();
    });
  }
  initUser() {

    this.usuarioAuxiliar = {
      id: '',
      username: '',
      password: '',
      foto: '',
      nombre: '',
      cedula: '',
      telefono: '',
      perfil: Perfil.Estilista,

    };
  }
  initUserUpdate() {

    this.userActualizado = {
      id: '',
      username: '',
      password: '',
      foto: '',
      nombre: '',
      cedula: '',
      telefono: '',
      perfil: Perfil.Estilista,
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
  cancel() {
    this.modal.dismiss(null, 'cancel');
    this.router.navigate(['/home']).then(() => {
      window.location.reload();
    });
    this.scrollToTop();
  }
  scrollToTop() {
    this.content.scrollToTop(400);
  }
}
