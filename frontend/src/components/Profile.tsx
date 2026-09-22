import { useQuery } from "@tanstack/react-query";
import axios from "../utils/config"

type user = {
  id: number
  name: string
  email: string
  role: 'admin' | 'user'
}

type userQuery = {
    data: user,
    isLoading: boolean,
    error: Error | null
}

function Profile() {
    const {data, isLoading, error} = useQuery({
        queryKey: ["profile"],
        queryFn: async () => {
            const res = await axios.get("/api/me", {
                withCredentials: true
            });

            return res.data.data;
        }
    }) as userQuery

    if (isLoading) return <div className="state-card"><span className="loading-orb" aria-hidden="true"></span><span>Loading profile...</span></div>

    if (error) return <div className="state-card state-error"><span className="state-icon" aria-hidden="true">!</span><span>Error loading profile</span></div>

    return <div className="profile-page">
        <header className="profile-heading">
            <span className="eyebrow">Account</span>
            <h1>Your profile</h1>
            <p>Your practice identity and account details.</p>
        </header>
        <div className="profile-card">
            <div className="profile-avatar" aria-hidden="true">{data.name?.charAt(0).toUpperCase()}</div>
            <div className="profile-details">
                <div className="profile-row"><span>Name</span><strong>{data.name}</strong></div>
                <div className="profile-row"><span>Email</span><strong>{data.email}</strong></div>
                <div className="profile-row"><span>Role</span><strong className="role-badge">{data.role}</strong></div>
            </div>
        </div>
    </div>
}

export default Profile;
