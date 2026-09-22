import { useQuery } from "@tanstack/react-query";
import axios from "axios";

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

    if (isLoading) return <div>Loading...</div>

    if (error) return <div>Error - {}</div>

    return <>
        <div>
            <span>{data.name}</span>
            <span>{data.email}</span>
            <span>{data.role}</span>
        </div>
    </>
}

export default Profile;