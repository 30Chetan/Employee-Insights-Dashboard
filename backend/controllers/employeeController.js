const mockEmployees = [
    { id: 1, name: "Alice Johnson", role: "Software Engineer", department: "Engineering", salary: 120000, status: "Active", joinDate: "2021-03-15", performanceScore: 92 },
    { id: 2, name: "Bob Smith", role: "Product Manager", department: "Product", salary: 140000, status: "Active", joinDate: "2019-11-01", performanceScore: 88 },
    { id: 3, name: "Charlie Brown", role: "UX Designer", department: "Design", salary: 110000, status: "On Leave", joinDate: "2022-06-20", performanceScore: 95 },
    { id: 4, name: "Dana White", role: "Data Scientist", department: "Data", salary: 135000, status: "Active", joinDate: "2020-08-10", performanceScore: 90 },
    { id: 5, name: "Eva Green", role: "Marketing Lead", department: "Marketing", salary: 105000, status: "Active", joinDate: "2023-01-05", performanceScore: 85 }
];

const getEmployees = (req, res) => {
    setTimeout(() => {
        res.json({ success: true, data: mockEmployees });
    }, 500); // simulated lag
};

const getEmployeeById = (req, res) => {
    setTimeout(() => {
        const employee = mockEmployees.find(emp => emp.id === parseInt(req.params.id));
        if (!employee) return res.status(404).json({ success: false, message: "Employee not found" });
        res.json({ success: true, data: employee });
    }, 500);
};

module.exports = { getEmployees, getEmployeeById };
