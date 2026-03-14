const API_URL = 'http://localhost:5000/api';

export const fetchEmployees = async () => {
    try {
        const res = await fetch('https://backend.jotish.in/backend_dev/gettabledata.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: 'test',
                password: '123456'
            })
        });
        const data = await res.json();
        if (data && data.TABLE_DATA && data.TABLE_DATA.data) {
            return data.TABLE_DATA.data.map(row => ({
                name: row[0],
                department: row[1],
                city: row[2],
                id: row[3],
                date: row[4],
                salary: row[5]
            }));
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
