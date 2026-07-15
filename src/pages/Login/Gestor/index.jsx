import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./style.css";
import api from "../../../services/api";

export default function Login() {

  const title = "Gestor";
  const subtitle = "Faça seu Login";

  const navigate = useNavigate();

  const [failed, setFailed] = useState(false);

  const inputGDuq = useRef(null);
  const inputGPassword = useRef(null);


  const [cadastro, setCadastro] = useState({
    nome: "",
    cpf: "",
    email: "",
    password: "",
    idade: "",
    cargo: "F",
    hora_entrada: "",
    hora_saida: "",
    foto: null
  });


  function handleCadastroChange(e) {

    const { name, value, files } = e.target;

    setCadastro({
      ...cadastro,
      [name]: files ? files[0] : value
    });

  }


  async function handleLogin() {

    const duq = inputGDuq.current.value;
    const senha = inputGPassword.current.value;


    try {

      const response = await api.post("/login", {
        duq,
        password: senha,
        cargo: "G",
      });


      localStorage.setItem(
        "token",
        response.data.token
      );


      navigate("/home");


    } catch(error) {

      console.log(error);

      setFailed(true);

      setTimeout(() => {
        setFailed(false);
      },3000);

    }

  }



  async function handleCadastro() {


    const formData = new FormData();


    formData.append(
      "nome",
      cadastro.nome
    );


    formData.append(
      "cpf",
      cadastro.cpf
    );


    formData.append(
      "email",
      cadastro.email
    );


    formData.append(
      "password",
      cadastro.password
    );


    formData.append(
      "idade",
      cadastro.idade
    );


    formData.append(
      "cargo",
      cadastro.cargo
    );


    formData.append(
      "hora_entrada",
      cadastro.hora_entrada
    );


    formData.append(
      "hora_saida",
      cadastro.hora_saida
    );


    if(cadastro.foto){

      formData.append(
        "foto",
        cadastro.foto
      );

    }


    try {


      await api.post(
        "/create-user",
        formData,
        {
          headers:{
            "Content-Type":"multipart/form-data"
          }
        }
      );


      navigate("/home")



    } catch(error) {


      console.log(error);


      setFailed(true);


      setTimeout(() => {
        setFailed(false);
      },3000);


    }


  }



  return (

    <div>


      <div className="header">

        <h2>
          {title.split("").map((letter,index)=>(
            <span key={index}>
              {letter}
            </span>
          ))}
        </h2>


        <h3>
          {subtitle.split("").map((letter,index)=>(
            <span key={index}>
              {
                letter === " "
                ? "\u00A0"
                : letter
              }
            </span>
          ))}
        </h3>


      </div>



      <div className="login-container">



        {/* LOGIN GESTOR */}

        <div className="Gestor">


          <div className="top gestor">

            <h2>
              Login
            </h2>

          </div>



          <label>
            Email ou CPF
          </label>


          <input

            placeholder="Digite seu email ou CPF"

            ref={inputGDuq}

          />



          <label>
            Senha
          </label>


          <input

            type="password"

            placeholder="Digite sua senha"

            ref={inputGPassword}

          />



          <button
            onClick={handleLogin}
          >

            Login

          </button>


        </div>





        {/* CADASTRO FUNCIONÁRIO */}


        <div className="Funcionario">



          <div className="top funcionario">

            <h2>
              Cadastro
            </h2>

          </div>




          <label>
            Nome
          </label>

          <input

            name="nome"

            placeholder="Digite seu nome"

            onChange={handleCadastroChange}

          />




          <label>
            CPF
          </label>

          <input

            name="cpf"

            placeholder="Digite seu CPF"

            onChange={handleCadastroChange}

          />




          <label>
            Email
          </label>


          <input

            name="email"

            placeholder="Digite seu email"

            onChange={handleCadastroChange}

          />





          <label>
            Senha
          </label>


          <input

            type="password"

            name="password"

            placeholder="Digite sua senha"

            onChange={handleCadastroChange}

          />





          <label>
            Foto
          </label>


          <input

            type="file"

            accept="image/*"

            name="foto"

            onChange={handleCadastroChange}

          />





          <label>
            Idade
          </label>


          <input

            type="number"

            name="idade"

            placeholder="Digite sua idade"

            onChange={handleCadastroChange}

          />





          <label>
            Hora de entrada
          </label>


          <input

            type="time"

            name="hora_entrada"

            onChange={handleCadastroChange}

          />





          <label>
            Hora de saída
          </label>


          <input

            type="time"

            name="hora_saida"

            onChange={handleCadastroChange}

          />





          <button
            onClick={handleCadastro}
          >

            Cadastrar

          </button>




        </div>




      </div>





      {
        failed && (

          <div className="fail">

            <span className="fail-icon">
              !
            </span>


            <p>
              Falha na autenticação ou cadastro.
            </p>


          </div>

        )
      }



    </div>

  );

}