import { useRouter } from "next/navigation";

export default function AccessDenied() {
  const router = useRouter();
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <div className="bg-blue-500 p-8 rounded shadow-md w-full max-w-xs flex flex-col items-center">
        <h1 className="text-2xl font-bold mb-4 text-white">Access Denied</h1>
        <p className="text-base text-white mb-6 text-center">
          You do not have permission to access this page or perform this action.
        </p>
        <button
          className="bg-white text-blue-600 px-4 py-2 rounded hover:bg-gray-200 font-semibold"
          onClick={() => router.replace("/admin-dashboard")}
        >
          Back to Dashboard
        </button>
      </div>
    </div>
  );
}
