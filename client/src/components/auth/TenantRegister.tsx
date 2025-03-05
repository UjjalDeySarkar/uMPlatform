import { useState } from "react";
import axios, {AxiosError} from "axios";
import config from "../../config";
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify'; 
import 'react-toastify/dist/ReactToastify.css';

interface TenantRegistrationFormData {
  schema_name: string,
  name: string,
}

interface Tenant {
  id: number;
  name: string;
  domain: string;
}

interface DataResponse {
  tenant: Tenant;
  message: string;
}

const TenantRegister: React.FC = () => {
  const [formData, setFormData] = useState<TenantRegistrationFormData>({
    schema_name: "",
    name: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    if (!formData.schema_name) newErrors.schema_name = "Sub domain is required";
    if (!formData.name) newErrors.name = "Name is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setError(null);

    try {
      const response = await axios.post<DataResponse>(`${config.API_BASE_URL}/register/`, formData);
      toast.success(response.data.message);
      navigate('/register', { state: { responseData: response.data, postUrl: response.data.tenant.domain } });

    } catch (err) {
      if (axios.isAxiosError(err)) {
        const axiosError = err as AxiosError;
        if (axiosError.response && axiosError.response.status === 400) {
          const errorData = axiosError.response.data as {
            [key: string]: string[];
          };
          const errorMessages = Object.values(errorData)
            .flat()
            .join(" ");
          if (errorMessages == "tenant with this schema name already exists.") {
            toast.error("this subdomain is taken");
          }
        } else {
          setError("Registration failed. Please try again.");
        }
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-3xl font-semibold text-center text-gray-800"> Registrater Your Organization</h2>
        {error && <p className="text-red-500 text-center">{error}</p>}

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-gray-700">Sub Domain</label>
            <input
              type="text"
              name="schema_name"
              value={formData.schema_name}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
            {errors.schema_name && <p className="mt-1 text-sm text-red-600">{errors.schema_name}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
            {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white ${loading ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
          >
            {loading ? "Processing..." : "Register"}
          </button>
        </form>
        <ToastContainer position="top-right" autoClose={6000} />
      </div>
    </div>
  );
};

export default TenantRegister;
