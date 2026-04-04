import {Link} from'react-router-dom';
import Nav from '../components/Nav';
import profileImg from '../assets/imgs/profile.jpg';
import setupImg from '../assets/imgs/setup.jpg';
import collab from '../assets/imgs/collaboration.jpg';

function AboutPage() {
    return (
        <>
            <Nav />
            <main className="container page">
        
                <section className="section-card">
                    <img src={profileImg} alt="Portrait of Jayvee Reyes" className="profile-pic" />

                    <h1>My Journey with Web Development</h1>
                    <p>My journey into technology began with a simple curiosity: how do websites actually work? That curiosity quickly turned into a passion when I realized that software could do more than just entertain. It could solve real-world problems.</p>
                    
                    <br />
                    <img src={setupImg} alt="A workspace with dual monitors showing database schemas"  />
                    <br />

                    <p>Currently, I am a student at Don Mariano Marcos Memorial State University, where I focus on backend architecture. What drives me is the satisfaction of taking a buggy, inefficient system and making it run seamlessly.</p>
                </section>

                <section className="section-card">
                    <blockquote>
                        "Programming isn't about what you know; it's about what you can figure out." — Chris Pine
                    </blockquote>
                </section>

                <section className="section-card">
                    <h2>What I Love About C#</h2>
                    <p>I chose C# and the .NET ecosystem because of its strong typing and robust framework. Building applications with ASP.NET Core allows me to create secure, scalable web apps efficiently. I particularly enjoy working with Entity Framework to manage databases without writing raw SQL.</p>
                </section>

                <section className="section-card">
                    <h2><strong>TRY SOME GAMES!!</strong></h2>
                    <p>Play some space invader game to pass time...</p>
                    <a href="game/game.html" className="btn btn-secondary" target="_blank" rel="noreferrer">Open the game</a>
                </section>

                <section className="section-card">
                    <h2>My Learning Timeline</h2>
                    <ol>
                        <li>
                            <strong>2023:</strong> Started BS Computer Science degree and learned basic HTML/CSS.
                        </li>
                        <li>
                            <strong>2024:</strong> Dived into C# and Object-Oriented Programming principles.
                        </li>
                        <li>
                            <strong>2025:</strong> Built my first major project, "eTourMoElyu," a tourism website.
                        </li>
                        <li>
                            <strong>2026:</strong> Currently exploring ASP.NET Identity and advanced security practices.
                        </li>
                    </ol>
                    
                    <br />
                    <img src={collab} alt="Students collaborating on a coding project" />
                </section>

            </main>

            <footer>
                <div className="container">
                    <p>&copy; 2026 Jayvee Reyes. All Rights Reserved.</p>
                    <p>Contact: myemail@gmail.com | [Province], [Country]</p>
                </div>
            </footer>
        </>
        
    );
}

export default AboutPage;