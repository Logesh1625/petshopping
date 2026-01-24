import React, { useState } from "react";
function Login() {

  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showLoginPassword2, setShowLoginPassword2] = useState(false);
  const [isRegister, setIsRegister] = useState(false);

  const [registeredUser, setRegisteredUser] = useState(null); // ✅ REQUIRED

  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });

  const [registerData, setRegisterData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    phone: "",
    terms: false,
  });

  /* ---------------- HANDLERS ---------------- */

  const handleLoginChange = (e) => {
    const { name, value, type, checked } = e.target;
    setLoginData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleRegisterChange = (e) => {
    const { name, value, type, checked } = e.target;
    setRegisterData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleLoginSubmit = (e) => {
    e.preventDefault();

    if (!loginData.email || !loginData.password) {
      alert("Please fill all login fields");
      return;
    }

    if (!registeredUser) {
      alert("Please register first before login");
      return;
    }

    if (
      loginData.email !== registeredUser.email ||
      loginData.password !== registeredUser.password
    ) {
      alert("Invalid email or password");
      return;
    }

    alert("WELCOME BACK TO THE GOLDEN PET PAWS 🐾");
  };

  const handleRegisterSubmit = (e) => {
    e.preventDefault();

    if (!registerData.terms) {
      alert("Please accept terms & conditions");
      return;
    }

    setRegisteredUser({
      email: registerData.email,
      password: registerData.password,
    });

    alert("ACCOUNT CREATED SUCCESSFULLY 🎉");
    setIsRegister(false);
  };

  /* ---------------- STYLES (UNCHANGED) ---------------- */

  const styles = {
    page: {
      minHeight: "100vh",
      backgroundImage:
        "url(https://img.freepik.com/premium-photo/group-cute-puppies-small-canine-family_174954-10681.jpg)",
      backgroundSize: "cover",
      backgroundPosition: "center",
      fontFamily: "'Segoe UI', sans-serif",
    },
    overlay: {
      minHeight: "100vh",
      backgroundColor: "rgba(0,0,0,0.45)",
    },
    navbar: {
      height: "70px",
      backgroundColor: "#0f172a",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "0 40px",
      color: "#fff",
    },
    navLinks: {
      display: "flex",
      gap: "30px",
    },
    link: {
      color: "#fff",
      textDecoration: "none",
      fontSize: "18px",
    },
    container: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      paddingTop: "60px",
    },
    card: {
      background: "white",
      padding: "40px",
      borderRadius: "15px",
      width: "100%",
      maxWidth: "420px",
      boxShadow: "0 15px 30px rgba(0,0,0,0.3)",
    },
    input: {
      width: "100%",
      padding: "12px",
      marginBottom: "14px",
      borderRadius: "6px",
      border: "1px solid #ccc",
    },
    eye: {
      float: "right",
      position: "relative",
      top: "-85px",
      cursor: "pointer",
    },


    forget:{
textAlign:"right",
            top:"-17px"

    },
    button: {
      width: "100%",
      padding: "12px",
      backgroundColor: "#4A90E2",
      color: "#fff",
      border: "none",
      borderRadius: "6px",
      fontWeight: "bold",
      cursor: "pointer",
    },
    switchText: {
      textAlign: "center",
      marginTop: "18px",
    },
    switchLink: {
      color: "#4A90E2",
      fontWeight: "bold",
      cursor: "pointer",
    },
    footer: {
      textAlign: "center",
      color: "#fff",
      marginTop: "40px",
      fontStyle: "italic",
    },
    wel:{
      textAlign:"center",
      marginTop: "-40px",
    },
    
    txt: {
    color:"white",
  position: "fixed",
  left: "10px",
  bottom: '10px',

 
 
},

txt2:{
  
  
  color:"white",
  position: "fixed",
  right: "100px",
  top: "100px",
  width:"300px",
  height:"600px",
  padding:"10px",
  wordspacing:"200px",
}



  };

  /* ---------------- JSX ---------------- */

  return (
    <div style={styles.page}>
      <div style={styles.overlay}>

        <div style={styles.navbar}>
          <h2>THE GOLDEN PET PAWS</h2>

          <div style={styles.navLinks}>
            <a style={styles.link} href="https://templatesjungle.com/wp-content/uploads/2023/03/PET-SHOP-%E2%80%93-Pet-Shop-Website-Template-1024x768.jpg">Home</a>
            <a style={styles.link} href="https://templatesjungle.com/wp-content/uploads/2023/03/Pet-Clinic-Free-Pet-Website-Template.jpg">About</a>
            <a style={styles.link} href="https://mir-s3-cdn-cf.behance.net/project_modules/max_1200/3738d1203413097.6696d1ad3fc12.jpg">Services</a>
            <a style={styles.link}href="https://static.vecteezy.com/system/resources/previews/021/551/119/non_2x/landing-page-template-for-animal-shop-online-petstore-dog-cat-shop-pets-care-screen-for-ui-web-flat-cartoon-style-vector.jpg">Contact</a>
          </div>
        </div>

        <div style={styles.container}>

          {!isRegister && (
            <div style={styles.card}>
              <div style={styles.wel}>  <h2>Welcome Back</h2>
   <p> Enter your details</p> </div>
              <form onSubmit={handleLoginSubmit}>
                <p >Email id</p>
                <input type="email" 
                name="email" 
                placeholder="Email"
                  style={styles.input} onChange={handleLoginChange} />
                   <p>Password</p>
                <input type={showLoginPassword ? "text" : "password"}
                  name="password"
                   placeholder="Password"
                  style={styles.input} onChange={handleLoginChange} />
                  
<div style={styles.checkboxRw}>
                  <input
                    type="checkbox"
                    name="remember"
                    onChange={handleLoginChange}
                  />
                  <label>Remember me</label>
                </div>

                <div style={styles.forget}>
                  <a href="#">
                        Forget password
                  </a>
                </div>



                <svg onClick={() => setShowLoginPassword(!showLoginPassword)}
                  style={styles.eye}
                   xmlns="http://www.w3.org/2000/svg"
                  width="20"
                   height="20" 
                   fill="gray"
                    viewBox="0 0 16 16">
                  <path d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8z"/>
                  <path d="M8 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"/>
                </svg>

                <button style={styles.button}>Login</button>
              </form>

              <div style={styles.switchText}>
                Don't have an account?{" "}
                <span style={styles.switchLink} onClick={() => setIsRegister(true)}>
                  CREATE NOW
                </span>
              </div>
            </div>
          )}

          {isRegister && (
            <div style={styles.card}>
              <h2>Create Account</h2>

              <form onSubmit={handleRegisterSubmit}>
                <input name="firstName"
                 placeholder="First Name"
                  style={styles.input}
                   onChange={handleRegisterChange} />
                <input name="lastName" 
                placeholder="Last Name"
                  style={styles.input} 
                  onChange={handleRegisterChange} />
                <input type="email" 
                name="email" placeholder="Email"
                  style={styles.input}
                   onChange={handleRegisterChange} />
                <input type={showLoginPassword2 ? "text" : "password"}
                  name="password" 
                  placeholder="Password"
                  style={styles.input} 
                  onChange={handleRegisterChange} />

                <svg onClick={() => setShowLoginPassword2(!showLoginPassword2)}
                  style={styles.eye} 
                  xmlns="http://www.w3.org/2000/svg"
                  width="20" 
                  height="20"
                   fill="white" viewBox="0 0 16 16">
                  <path d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8z"/>
                  <path d="M8 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"/>
                </svg>

                <input name="phone" placeholder="+91 XXXXXXXXXX"
                  style={styles.input} onChange={handleRegisterChange} />

                <label>
                  <input type="checkbox" name="terms"
                    onChange={handleRegisterChange} /> Accept terms & Conditions
                </label>

                <button style={styles.button}>Register</button>
              </form>

              <div style={styles.switchText}>
                Already have an account?{" "}
                <span style={styles.switchLink}
                 onClick={() => setIsRegister(false)}>
                  LOGIN
                </span>
              </div>
            </div>
            
          )}

        </div>


              <div style={styles.txt} >
      <p>Dogs are not our whole life, but they make our lives whole.</p>
      <p>Every dog deserves a home full of love.</p>
      <p>The better I get to know people, the more I love my dog.</p>
      <p>Dogs speak, but only to those who know how to listen.</p>
     <p> “Love is a four-legged word.”</p>
      <p>“Happiness is a warm puppy.”
</p>
<p>“Pets teach us the purest form of love—without conditions.”</p>
<p>“Pets leave paw prints on our hearts forever.”
</p>
    </div>
    
    <div style= {styles.txt2} >
      
       <p >
      Pets are more than just animals; they are loyal companions who fill our lives with warmth, joy, and unconditional love. With every wag of a tail or gentle purr, they teach us kindness, patience, and the beauty of living in the moment. A lovable pet turns a house into a home and makes even the quietest days feel special.
    </p>
    </div>
        <div style={styles.footer}>
          Developed by <b>LOGESH THANGARAJ</b> from <b>FOXCONN</b>
        </div>

      </div>
    </div>
  );
}

export default Login;