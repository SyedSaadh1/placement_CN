const Interview = require("../models/interview");
const Student = require("../models/student");

// render add student page
module.exports.addStudent = (req, res) => {
    if (req.isAuthenticated()) {
        return res.render("add_student", {
            title: "Add Student",
        });
    }

    return res.redirect("/");
};

// render edit student page
module.exports.editStudent = async(req, res) => {
    const student = await Student.findById(req.params.id);

    if (req.isAuthenticated()) {
        return res.render("edit_student", {
            title: "Edit Student",
            student_details: student,
        });
    }

    return res.redirect("/");
};


// creating a new Student
module.exports.create = async(req, res) => {
    try {
        const {
            name,
            email,
            batch,
            college,
            placementStatus,
            dsa_score,
            react_score,
            webdev_score,
        } = req.body;

        // check if student already exists
        const existingStudent = await Student.findOne({ email });

        if (!existingStudent) {
            const newStudent = await Student.create({
                name,
                email,
                college,
                batch,
                dsa_score,
                react_score,
                webdev_score,
                placementStatus,
            });

            if (newStudent) {
                //  req.flash("success", "Student added successfully!");
                return res.redirect("back");
            } else {
                //  req.flash("error", "Failed to add student. Please try again.");
                return res.redirect("back");
            }
        } else {
            // req.flash("error", "Student with this email already exists.");
            return res.redirect("back");
        }
    } catch (err) {
        console.log(err);
        // req.flash("error", "Error in adding student. Please try again.");
        return res.redirect("back");
    }
};

// Deletion of student
module.exports.destroy = async(req, res) => {
    try {
        const { studentId } = req.params;
        const student = await Student.findById(studentId);

        if (!student) {
            return res.redirect("back");
        }

        const interviewsOfStudent = student.interviews;

        // Delete reference of student from companies in which this student is enrolled
        if (interviewsOfStudent.length > 0) {
            for (let interview of interviewsOfStudent) {
                await Interview.findOneAndUpdate({ company: interview.company }, { $pull: { students: { student: studentId } } });
            }
        }

        // Remove the student
        await Student.deleteOne({ _id: studentId });

        // req.flash("success", "Student deleted successfully!");
        return res.redirect("back");
    } catch (err) {
        console.log("error", err);
        // req.flash("error", "Error in deleting student. Please try again.");
        return res.redirect("back");
    }
};

// update student details
module.exports.update = async(req, res) => {
    try {
        const student = await Student.findById(req.params.id);
        const {
            name,
            college,
            batch,
            dsa_score,
            react_score,
            webdev_score,
            placementStatus,
        } = req.body;

        if (!student) {
            return res.redirect("back");
        }

        student.name = name;
        student.college = college;
        student.batch = batch;
        student.dsa_score = dsa_score;
        student.react_score = react_score;
        student.webdev_score = webdev_score;
        student.placementStatus = placementStatus;

        student.save();
        return res.redirect("/dashboard");
    } catch (err) {
        console.log(err);
        return res.redirect("back");
    }
};