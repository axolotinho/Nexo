import { useEffect, useState } from "react"
import './style.css'

export default function Welcome() {
  // useEffect (() =>  {
  //   const token = localStorage.getItem("token", token) 
  // }, []);
  return (
    <div>
      <h3>Seja bem-vindo ao</h3>
      <h1>Nexo</h1>
      <button>empresa</button>
      <button>funcionario</button>
    </div>
  );
}