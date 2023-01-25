import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { UserService } from '../api/user.service';
import { finalize } from 'rxjs/operators';
import { User } from '../entidades/User';
import { Perfil } from '../Perfil.enum';

@Component({
  selector: 'app-registro',
  templateUrl: './registro.page.html',
  styleUrls: ['./registro.page.scss'],
})
export class RegistroPage implements OnInit {

  userRegisterForm: FormGroup = this.fb.group({
    'username': ['', [Validators.required]],
    'password': ['', [Validators.required]],
    // 'foto': ['', [Validators.required]],
    'nombre': ['', [Validators.required]],
    'cedula': ['', [Validators.required]],
    'telefono': ['', [Validators.required]],
    'perfil': ['', [Validators.required]],
  });

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private toastController: ToastController,
    private router: Router,
    public storage: AngularFireStorage
  ) { }
  newImage = '';
  newFile: any;
  newUser: User;
  uid = '';
  uploadedImage: File ;
  ngOnInit() {
    this.userRegisterForm.reset();
    this.initUser();
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




 
  registrarse() {
    if (!this.userRegisterForm.valid) {
      return false;
    } else {
      
      // this.userRegisterForm.controls['foto'].setValue("Estilistas/"+this.uid); 
      this.userService.registrarse(this.userRegisterForm.value).then(async() => {
        this.uid = localStorage.getItem('UID')
        this.mostrarMensaje('Usuario creado exitosamente!')
        
        console.log(this.uid)
        const path = "Estilistas";
        const name = this.uid; 
        const file= this.uploadedImage;

        console.log("file es "+file)
        const res = await this.subirImagen(file, path, name)
        this.newUser.foto = res; 
        this.userRegisterForm.reset();
        this.router.navigate(['/home']);
      });

    }
    return true;

  }

  async mostrarImagen(event: any) {
 
    if (event.target.files && event.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.newUser.foto = e.target.result;
        this.uploadedImage = event.target.files[0];
      };
      reader.readAsDataURL(event.target.files[0]);
    }
  }

 
  async mostrarMensaje(mensaje: any) {
    const toast = await this.toastController.create({
      position: 'top',
      message: mensaje,
      duration: 3000
    });
    toast.present();
  }
  initUser() {

    this.newUser = {
      id: '',
      username: '',
      password: '',
      foto: '',
      nombre  : '',
      cedula  : '',
      telefono: '',
      perfil:Perfil.Estilista,
    };
  }

}
