let url = "";

const ambiente = "producao";


if (ambiente === "dev"){
    url = "http://localhost:3000"
} else {
    url = "https://backend-portal-orelha.onrender.com";
}

export default url
