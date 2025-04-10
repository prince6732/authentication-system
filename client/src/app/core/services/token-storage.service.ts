import { Injectable } from '@angular/core';
import { jwtDecode } from "jwt-decode";
import { User } from '../../shared/models/user.model';

const TOKEN_KEY ='auth-token';
const USER_KEY = 'auth-user';


@Injectable({
  providedIn: 'root'
})
export class TokenStorageService {

  constructor() { }
  signOut():void{
    window.localStorage.clear();
  }

  public saveToken(token:string):void{
    window.localStorage.removeItem(TOKEN_KEY)
    window.localStorage.setItem(TOKEN_KEY, token)
  }

 public getToken():string | null{
  return window.localStorage.getItem(TOKEN_KEY)
 }

  public saveUser(user:any):void{
    window.localStorage.removeItem(USER_KEY);
    window.localStorage.setItem(USER_KEY, JSON.stringify(user))
  }

  public getUser():any{
    const user = window.localStorage.getItem(USER_KEY);
    if(user){
      return JSON.parse(user)
    }
    return {}
  }

  public isAuthenticated():boolean{
    const token = window.localStorage.getItem(TOKEN_KEY);
    if(token){
      const decoded: any = jwtDecode(token);
      // console.log(decoded.exp);
      // console.log(Math.floor(Date.now() / 1000));
      if(Math.floor(Date.now() / 1000) > decoded.exp){
        window.localStorage.removeItem(USER_KEY);
        window.localStorage.removeItem(TOKEN_KEY);
        return false;
      }
      return true
    }
    return false
  }
}
