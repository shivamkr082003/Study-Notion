const path = require('path');
const Category = require("./models/categorym");

function getRandomInt(max) {
  return Math.floor(Math.random() * max)
}

exports.createCategory = async (req, res) => {
  try {
    //fatch data
    const { name, description } = req.body;
    // validation 
    if (!name || !description) {
      return res.status(400).json({
        success: true,
        message: "All fields are required.",
      })
    }
    // create entry in db
    const categoryDetails = await Category.create({
      name: name,
      description: description,
    });

    return res.status(200).json({
      success: true,
      message: "Category Created Successfully."
    })



  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};



exports.showAllCategories = async (req, res) => {
  try {
    const allCategorys = await Category.find({}, { name: true, description: true }); // no any sfacific property are define for find but make you will get data must be included name and description.
    return res.status(200).json({
      susccess: true,
      message: "All Category returned successfully.",
      data: allCategorys,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};




// Helper function to get a random integer

// Utility function to get a random integer
// const getRandomInt = (max) => Math.floor(Math.random() * max);

exports.categoryPageDetails = async (req, res) => {
  try {
    const { categoryId } = req.body;

    if (!categoryId) {
      return res.status(400).json({
        success: false,
        message: "Category ID is required",
      });
    }

    // Get selected category with its published courses
    const selectedCategory = await Category.findById(categoryId)
      .populate({
        path: "courses",
        match: { status: "Published" },
        populate: [
          {
            path: "instructor",
            populate: { path: "additionalDetails" },
          },
          { path: "ratingAndReviews" },
        ],
      })
      .lean();

    if (!selectedCategory) {
      return res.status(404).json({
        success: false,
        message: "Selected category not found",
      });
    }

    // Get all categories except the selected one
    const differentCategory = await Category.find({ _id: { $ne: categoryId } })
      .populate({
        path: "courses",
        match: { status: "Published" },
        populate: [
          {
            path: "instructor",
            populate: { path: "additionalDetails" },
          },
          { path: "ratingAndReviews" },
        ],
      })
      .lean();

    // Extract all courses from other categories
    const differentCourses = differentCategory.flatMap((cat) => cat.courses || []);

    // Get most selling courses from all published ones
    const allCourses = [ ...(selectedCategory.courses || []), ...differentCourses ];
    const mostSellingCourses = allCourses
      .sort((a, b) => (b.sold || 0) - (a.sold || 0))
      .slice(0, 10);

    return res.status(200).json({
      success: true,
      data: {
        selectedCategory,
        differentCourses,
        mostSellingCourses,
      },
    });

  } catch (error) {
   // console.error("Error in categoryPageDetails:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// exports.categoryPageDetails = async (req, res) => {
// 	try {
// 		const { categoryId } = req.body;

// 		// Get courses for the specified category
// 		const selectedCategory = await Category.findById(categoryId)
// 			.populate("courses")
// 			.exec();
// 	//	console.log(selectedCategory);
// 		// Handle the case when the category is not found
// 		if (!selectedCategory) {
// 		//	console.log("Category not found.");
// 			return res
// 				.status(404)
// 				.json({ success: false, message: "Category not found" });
// 		}
// 		// Handle the case when there are no courses
// 		if (selectedCategory.courses.length === 0) {
// 		//	console.log("No courses found for the selected category.");
// 			return res.status(404).json({
// 				success: false,
// 				message: "No courses found for the selected category.",
// 			});
// 		}

// 		const selectedCourses = selectedCategory.courses;

// 		// Get courses for other categories
// 		const categoriesExceptSelected = await Category.find({
// 			_id: { $ne: categoryId },
// 		}).populate("courses");
// 		let differentCourses = [];
// 		for (const category of categoriesExceptSelected) {
// 			differentCourses.push(...category.courses);
// 		}

// 		// Get top-selling courses across all categories
// 		const allCategories = await Category.find().populate("courses");
// 		const allCourses = allCategories.flatMap((category) => category.courses);
// 		const mostSellingCourses = allCourses
// 			.sort((a, b) => b.sold - a.sold)
// 			.slice(0, 10);

// 		res.status(200).json({
// 			selectedCourses: selectedCourses,
// 			differentCourses: differentCourses,
// 			mostSellingCourses: mostSellingCourses,
// 		});
// 	} catch (error) {
// 		return res.status(500).json({
// 			success: false,
// 			message: "Internal server error",
// 			error: error.message,
// 		});
// 	}
// };

