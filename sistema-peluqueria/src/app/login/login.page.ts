import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { UserService } from '../api/user.service';
import { FlashMessagesService } from 'flash-messages-angular'; 
@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {

  userLoginForm: FormGroup = this.fb.group({
    'email': ['', [Validators.required]],
    'password': ['', [Validators.required]],
  })

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private flashMessages: FlashMessagesService,
    private toastController: ToastController,
    private router: Router
  ) { }

  ngOnInit() {
    this.userLoginForm.reset();
  }
  registrarse() {
    //para navegar a otro componente usamos la clase router, la cual es un servicio
    this.router.navigate(["/register"]).then(() => {
      window.location.reload();
    });
    console.log('registro');
  }
  async login() {
 
    if(!this.userLoginForm.valid){
      return false;
    }else{
    this.userService.login(this.userLoginForm.get("email").value, this.userLoginForm.get("password").value)
      .then( res => {
        this.router.navigate(['/home']);
        this.mostrarMensaje('Ha iniciado sesion correctamente');
      })
      .catch(error =>{
        this.flashMessages.show(error.message, {
          cssClass: 'alert-danger', timeout: 4000
        });
      });
      return true;
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

}
