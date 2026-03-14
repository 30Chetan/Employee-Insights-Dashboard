const getEmployees = async (req, res) => {
    try {
        const response = await fetch('https://backend.jotish.in/backend_dev/gettabledata.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: 'test',
                password: '123456'
            })
        });
        const data = await response.json();

        let formattedData = [];
        if (data && data.TABLE_DATA && data.TABLE_DATA.data) {
            formattedData = data.TABLE_DATA.data.map(row => ({
                name: row[0],
                department: row[1],
                city: row[2],
                id: String(row[3]), // Ensure ID maps uniformly
                joinDate: row[4],
                salary: parseFloat(String(row[5]).replace(/[^0-9.-]+/g, "")) || 0,
                status: 'Active',
                performanceScore: Math.floor(Math.random() * 15) + 85,
                role: `${row[1]} Specialist`
            }));
        }
        res.json({ success: true, data: formattedData });
    } catch (error) {
        console.error("Proxy Fetch Error:", error);
        res.status(500).json({ success: false, error: error.message });
    }
};

const getEmployeeById = async (req, res) => {
    try {
        const response = await fetch('https://backend.jotish.in/backend_dev/gettabledata.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: 'test',
                password: '123456'
            })
        });
        const data = await response.json();
        const row = data?.TABLE_DATA?.data?.find(r => String(r[3]) === String(req.params.id));

        if (!row) {
            return res.status(404).json({ success: false, message: "Employee not found" });
        }

        const employee = {
            name: row[0],
            department: row[1],
            city: row[2],
            id: String(row[3]),
            joinDate: row[4],
            salary: parseFloat(String(row[5]).replace(/[^0-9.-]+/g, "")) || 0,
            status: 'Active',
            performanceScore: Math.floor(Math.random() * 15) + 85,
            role: `${row[1]} Specialist`
        };

        res.json({ success: true, data: employee });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

module.exports = { getEmployees, getEmployeeById };
