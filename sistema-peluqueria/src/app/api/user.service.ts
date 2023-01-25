import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument } from '@angular/fire/compat/firestore';
import { AngularFireStorage, } from '@angular/fire/compat/storage';
import { Observable } from 'rxjs';
import { ToastController } from '@ionic/angular';
import { AngularFireAuth } from "@angular/fire/compat/auth";
import { map } from 'rxjs/operators';
import { getAuth, updateEmail, updatePassword } from "firebase/auth";
import { User } from '../entidades/User';
import { finalize } from 'rxjs/operators';  
@Injectable({
  providedIn: 'root'
})
export class UserService {
  private dbPath = '/Estilistas';
  usersRef: AngularFirestoreCollection<User>;
  documento: AngularFirestoreDocument<User>;
  constructor(
    private db: AngularFirestore,
    private authService: AngularFireAuth,
    private toastController: ToastController,
    public storage: AngularFireStorage) {
    this.usersRef = db.collection(this.dbPath);
  }

  registrarse(user: User): any {
    return new Promise((resolve, reject) => {
      this.authService.createUserWithEmailAndPassword(user.username, user.password).then(datos => {
        resolve(datos)
        localStorage.setItem('UID', datos.user.uid);
        user.id = datos.user.uid 
        // this.create(datos,this.dbPath,user.id)
        this.create(user,user.id)
      },
        error => {
          reject(error)
          this.mostrarMensaje(error)
        })

    })
  }
 
  login(email: string, password: string) {
    return new Promise((resolve, reject) => {
      this.authService.signInWithEmailAndPassword(email, password)
        .then(datos => {
          resolve(datos),
            localStorage.setItem('UID', datos.user.uid)
        },
          error => reject(error)
        )
    })
  }

  uploadImage(file: any, path: string, nombre: string): Promise<string> {
    return new Promise(  resolve => {
        const filePath = path + '/' + nombre;
        const ref = this.storage.ref(filePath);
        const task = ref.put(file);
        task.snapshotChanges().pipe(
          finalize(  () => {
                ref.getDownloadURL().subscribe( res => {
                  const downloadURL = res;
                  resolve(downloadURL);
                  return;
                });
          })
       )
      .subscribe();
    });
}

  guardarUsuario() {
    this.authService.onAuthStateChanged(user => {
      if (user) {
        console.log("UID de usuario " + user.uid)
      }
    })
  }


  getAll(): AngularFirestoreCollection<User> {
    return this.usersRef;
  }

  getById(id: string): Observable<any> {
    return this.usersRef.doc(id).valueChanges();
  }

  getByUID(uid: string): Observable<any> {
    //se recupera el documento por el ID del documento del firestore
    return this.usersRef.doc(uid).valueChanges();
  }

 

  create(user: User,id:string): any {
    this.usersRef.doc(id).set(user)
    console.log("hola")
    return true;
  }

  updateinDB(user: User, id: string ): any {

    this.usersRef.doc(id).update(user)
    console.log("update")

    return true;
  }

  update(id: string, user: User){
    return this.usersRef.doc(id).update(user);
  }
  async updateinAuth(user: User, id: string )  {
 

    const auth = getAuth();
    await updateEmail(auth.currentUser,user.username).then(() =>{
      console.log("Email actualizado")
    }).catch((error) => {
      console.log("Email NO actualizado" + error)
    });
    // updatePassword(auth.currentUser,user.password).then(() =>{
    //   console.log("Password actualizado")
    // }).catch((error) => {
    //   console.log("Password NO actualizado" + error)
    // });
 
  }


  delete(id: string): Promise<void> {
    return this.usersRef.doc(id).delete();
  }
  getAuth() {
    return this.authService.authState.pipe( //esto regresaria el usuario autenticado en caso de haberlo
      map(auth => auth)
    );
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
