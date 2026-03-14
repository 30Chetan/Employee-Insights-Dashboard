const API_URL = 'http://localhost:5000/api';

export const fetchEmployees = async () => {
    try {
        const res = await fetch(`${API_URL}/employees`);
        const data = await res.json();
        if (data && data.success) {
            return data.data;
        }
        return [];
    } catch (error) {
        console.error("Error fetching employees:", error);
        return [];
    }
};

export const fetchEmployeeById = async (id) => {
    try {
        const res = await fetch(`${API_URL}/employees/${id}`);
        const data = await res.json();
        return data.data || null;
    } catch (error) {
        console.error("Error fetching employee:", error);
        return null;
    }
};
