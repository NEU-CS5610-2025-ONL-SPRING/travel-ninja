import { useAuthUser } from "../security/AuthContext";

export default function Profile() {
    const { user } = useAuthUser();

    return (
        <div>
            <div>
                <p>Name: {user?.name}</p>
            </div>
            <div>
                <p>📧 Email: {user?.email}</p>
            </div>
        </div>
    );
}
