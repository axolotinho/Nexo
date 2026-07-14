import { useState, useEffect} from 'react' 
import { useNavigate } from "react-router-dom";
import img1 from '../../assets/img1.jpg'
import img2 from '../../assets/img2.jpg'
import api from '../../services/api'
import './style.css'

export default function Home() {
  const title = "Chat"
  const [person, setPerson] = useState("")
  const description = person
  const navigate = useNavigate();

  const persons = [
    {
      id: 1,
      name: 'Amanda silveira',
      img: img1
    },
    {
      id: 2,
      name: 'Luíz carlos',
      img: img2
    }
  ]
  useEffect (() =>  {
    const token = localStorage.getItem("token");
    
    if (!token) {
      navigate("/");
    }
  }, []);

  return (
    <div>
    <div className="topo">

      <div className="barra">

        <div className="header-home">
          <h2>
            {title.split("").map((letter, index) => (
              <span key={index}>{letter}</span>
            ))}
          </h2>
        </div>


        <div className="links">

          <button className="active">
            <i className="fa-solid fa-house"></i>
          </button>

          <button onClick={() => navigate("/Calendar")}>
            <i className="fa-solid fa-calendar"></i>
          </button>

          <button onClick={() => navigate("/Chat")}>
            <i className="fa-solid fa-comment-dots"></i>
          </button>

          <button onClick={() => navigate("/Task")}>
            {dia}
          </button>

          <button onClick={() => navigate("/Ia")}>
            <i className="fa-solid fa-dove"></i>
          </button>

        </div>

      </div>

    </div>

      <div className='layout'>
        <div className='lateral'>
            {persons.map((person) => (
              <button key={person.id} onClick={() => setPerson(person.name)}>
                <img src={person.img}/>
                {person.name}
              </button>
            ))}
        </div>
        <div className='chat'>
          
            {person != ""
              &&  <div>
                    <div className="subtitulo">
                      {description.split("").map((letter, index) => (
                        <span key={index}>
                          {letter === " " ? "\u00A0" : letter}
                        </span>
                      ))}
                    </div>
                    <div className='history'>
                        
                    </div>
                    <div className='keyboard'>

                    </div>
                  </div>
            }
        </div>
      </div>
    </div>
  );
}