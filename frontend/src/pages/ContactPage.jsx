import {Link} from'react-router-dom';
import Nav from '../components/Nav';

function ContactPage() {
    return (
        <>
            <Nav />
            <main className="container page">
        
                <section className="section-card">
                    <h1>Get in Touch</h1>
                    <p>Do you have a project idea or a question about ASP.NET? Fill out the form below.</p>
                    <br />
                    
                    <form action="#" method="post">
                        <div>
                            <label htmlFor="fullname">Full Name</label>
                            <input type="text" id="fullname" name="fullname" placeholder="Enter your name" autoComplete="name" />
                            <span id="fullnameError" className="errorMessage"></span>
                        </div>

                        <div>
                            <label htmlFor="email">Email Address</label>
                            <input type="email" id="email" name="email" placeholder="name@example.com" autoComplete="email" />
                            <span id="emailError" className="errorMessage"></span>
                        </div>

                        <div>
                            <label htmlFor="message">Message</label>
                            <textarea id="message" name="message" rows="5" placeholder="How can I help you?"></textarea>
                            <span id="messageError" className="errorMessage"></span>
                        </div>

                        <button id="btnSubmit" type="submit" className="btn btn-primary">Send Message</button>
                    </form>
                </section>

                <section className="section-card">
                    <h2>My Location</h2>
                    <div className="map-placeholder">
                        <iframe id="mapFrame" width="100%" height="100%" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade" src="https://www.google.com/maps?q=DMMMSU+South+La+Union+Campus&output=embed"></iframe>
                    </div>
                </section>

                <section className="section-card">
                    <h2>Useful Resources</h2>
                    <p>Here are some tools and websites I use daily for development:</p>
                    
                    <table>
                        <thead>
                            <tr>
                                <th width="30%">Resource Name</th>
                                <th width="70%">Description</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td><strong>Microsoft Learn</strong></td>
                                <td>Official documentation and tutorials for .NET and C#.</td>
                            </tr>
                            <tr>
                                <td><strong>Stack Overflow</strong></td>
                                <td>A community forum for solving specific coding errors.</td>
                            </tr>
                            <tr>
                                <td><strong>MDN Web Docs</strong></td>
                                <td>The ultimate guide for HTML, CSS, and JavaScript standards.</td>
                            </tr>
                        </tbody>
                    </table>
                </section>

                <section className="section-card">
                    <h2>Connect Elsewhere</h2>
                    <ul>
                        <li><a href="https://github.com" className="target-link" target="_blank" rel="noreferrer">View my GitHub Profile</a></li>
                        <li><a href="https://www.facebook.com" className="target-link" target="_blank" rel="noreferrer">Connect on Facebook</a></li>
                    </ul>
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

export default ContactPage;