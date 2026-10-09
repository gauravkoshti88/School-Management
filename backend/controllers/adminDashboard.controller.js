import Teacher from "../models/teacher.model.js";
import PeonStaff from "../models/peonStaff.model.js";
import LibraryStaff from "../models/libraryStaff.model.js";

export const getAdminDashboard = async (req, res) => {
  try {
    const [
      totalTeachers,
      totalPeonStaff,
      totalLibraryStaff,
      activeTeachers,
      activePeonStaff,
      activeLibraryStaff,
      inactiveTeachers,
      inactivePeonStaff,
      inactiveLibraryStaff,
    ] = await Promise.all([
      Teacher.countDocuments(),
      PeonStaff.countDocuments(),
      LibraryStaff.countDocuments(),

      Teacher.countDocuments({ status: "active" }),
      PeonStaff.countDocuments({ status: "active" }),
      LibraryStaff.countDocuments({ status: "active" }),

      Teacher.countDocuments({ status: "inactive" }),
      PeonStaff.countDocuments({ status: "inactive" }),
      LibraryStaff.countDocuments({ status: "inactive" }),
    ]);

    const totalStaff = totalTeachers + totalPeonStaff + totalLibraryStaff;

    const activeStaff = activeTeachers + activePeonStaff + activeLibraryStaff;

    const inactiveStaff =
      inactiveTeachers + inactivePeonStaff + inactiveLibraryStaff;

    const [recentTeachers, recentPeonStaff, recentLibraryStaff] =
      await Promise.all([
        Teacher.find()
          .select(
            "firstName lastName email phone employeeId department status joiningDate",
          )
          .sort({ createdAt: -1 })
          .limit(5)
          .lean(),

        PeonStaff.find()
          .select(
            "firstName lastName email phone employeeId shift status joiningDate",
          )
          .sort({ createdAt: -1 })
          .limit(5)
          .lean(),

        LibraryStaff.find()
          .select(
            "firstName lastName email phone employeeId libraryRole status joiningDate",
          )
          .sort({ createdAt: -1 })
          .limit(5)
          .lean(),
      ]);

    const recentStaff = [
      ...recentTeachers.map((staff) => ({
        ...staff,
        staffType: "Teacher",
      })),

      ...recentPeonStaff.map((staff) => ({
        ...staff,
        staffType: "Peon Staff",
      })),

      ...recentLibraryStaff.map((staff) => ({
        ...staff,
        staffType: "Library Staff",
      })),
    ]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 8);

    return res.status(200).json({
      success: true,

      stats: {
        totalStaff,
        totalTeachers,
        totalPeonStaff,
        totalLibraryStaff,
        activeStaff,
        inactiveStaff,
      },

      recentStaff,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Unable to load admin dashboard.",
    });
  }
};
