import axios from "../../utils/config"
import { useState, type ChangeEvent, type FormEvent } from "react"
import { useNavigate } from "react-router-dom";

type formDataType = {
    name: string,
    email: string,
    password: string
}

type formState = [
    formData: formDataType,
    setFormData: React.Dispatch<React.SetStateAction<{
        name: string,
        email: string;
        password: string;
    }>>
]

function RegisterPage() {
    const [formData, setFormData] = useState({
        name: "",
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
            if (res.data.success === true) {
                navigate("/problems");
            }
        }).catch((err) => {
            alert("Register Failed" + err);
        }).finally(() => {
            setIsLoading(false);
        })
    }

    return <div className="auth-form-card">
            <span className="eyebrow">Start practicing</span>
            <h2>Create your account</h2>
            <p className="form-lead">Set up your account and make your next solved problem count.</p>
            <form onSubmit={handleSubmit}>
                <label className="field-label" htmlFor="register-name">Name</label>
                <input id="register-name" type="text" placeholder="Ada Lovelace" name="name" value={formData.name} onChange={handleChange} />
                <label className="field-label" htmlFor="register-email">Email address</label>
                <input id="register-email" type="email" placeholder="you@example.com" name="email" value={formData.email} onChange={handleChange} />
                <label className="field-label" htmlFor="register-password">Password</label>
                <input id="register-password" type="password" placeholder="Create a password" name="password" value={formData.password} onChange={handleChange} />
                <button className="primary-button" type="submit" disabled={isLoading}>{isLoading ? "Creating account..." : "Create account"}</button>
            </form>
        </div>
}

export default RegisterPage;
