import axios from "axios";
import { useState, type ChangeEvent, type FormEvent } from "react"
import { useNavigate } from "react-router-dom";

type formDataType = {
    email: string,
    password: string
}

type formState = [
    formData: formDataType,
    setFormData: React.Dispatch<React.SetStateAction<{
        email: string;
        password: string;
    }>>
]

function RegisterPage() {
    const [formData, setFormData] = useState({
        email: "",
        password: ""
    }) as formState;
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    function handleChange(e: ChangeEvent<HTMLInputElement>) {
        const { name, value } = e.target
        setFormData(prevState =>({
            ...prevState,
            [name]: value
        }))
    }

    function handleSubmit(e: FormEvent) {
        e.preventDefault()

        setIsLoading(true);
        axios.post("/api/auth/user/register", formData, {
            withCredentials: true
        }).then((res) => {
            if (res.data.status === true) {
                navigate("/problems");
            }
        }).catch((err) => {
            alert("Register Failed" + err);
        }).finally(() => {
            setIsLoading(false);
        })
    }

    return <>
        <div className="box">
            <h1>"User Register Page"</h1>
            <form onSubmit={handleSubmit}>
                <input type="email" placeholder="Enter your email" name="email" value={formData.email} onChange={handleChange} />
                <input type="password" placeholder="Enter your password" name="password" value={formData.password} onChange={handleChange} />
                <button type="submit" disabled={isLoading}>Register</button>
            </form>
        </div>
    </>
}

export default RegisterPage;