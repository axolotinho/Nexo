import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom";
import './style.css'

export default function Welcome() {
  const subtitle = "Seja bem-vindo ao";
  const title = "Nexo";
  const navigate = useNavigate();
  useEffect (() =>  {
    const token = localStorage.getItem("token");
    
    if (token) {
      navigate("/home");
    }
  }, []);
  return (
    <div className="welcome">
      <h3>
        {subtitle.split("").map((letter, index) => (
          <span key={index}>
            {letter === " " ? "\u00A0" : letter}
          </span>
        ))}
      </h3>

      <h1>
        {title.split("").map((letter, index) => (
          <span key={index}>{letter}</span>
        ))}
      </h1>

      <div className="buttons">
        <button onClick={() => navigate("/login/gestor")}>Gestor</button>
        <button onClick={() => navigate("/login/funcionario")}>Funcionário</button>
      </div>
    </div>
  );
}