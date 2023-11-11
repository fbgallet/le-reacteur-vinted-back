const express = require("express");
const fileUpload = require("express-fileupload");
//s;
const uploadToCloudinaryAngGetUrl = require("../utils/cloudinary");
const isAuthenticated = require("../middlewares/isAuthentificated");
const isOfferOk = require("../middlewares/isOfferOk");

const router = express.Router();

const Offer = require("../models/Offer");
const User = require("../models/User");

router.get("/offers", async (req, res) => {
  try {
    const { title, priceMin, priceMax, sort, page } = req.query;
    const filters = {};
    if (title) {
      filters.product_name = new RegExp(title, "i");
    }
    if (priceMin || priceMax) {
      filters.product_price = {};
      if (priceMin) filters.product_price["$gte"] = Number(priceMin);
      if (priceMax) filters.product_price["$lte"] = Number(priceMax);
    }
    const sortObject =
      sort === "price-desc" || sort === "price-asc"
        ? {
            product_price: sort.slice(6),
          }
        : {};
    const limitByPage = 5;

    const offers = await Offer.find(filters)
      .select("product_name product_price -_id")
      .sort(sortObject)
      .limit(limitByPage)
      .skip((page - 1) * limitByPage);
    //console.log(offers);
    res.status(201).json(offers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post(
  "/offer/publish",
  isAuthenticated,
  fileUpload(),
  isOfferOk,
  async (req, res) => {
    try {
      const newOffer = req.body.offer;
      // console.log(await newOffer.populate("owner"));
      if (req.files) {
        newOffer.product_image = await uploadToCloudinaryAngGetUrl(
          req.files.picture,
          {
            folder: `vinted/offers/${newOffer.owner}`,
          }
        );
      }
      newOffer.save();
      const populatedNewOffer = await newOffer.populate("owner");
      newOffer.owner = {
        account: {
          username: populatedNewOffer.owner.account.username,
          avatar: populatedNewOffer.owner.account.avatar,
        },
      };
      res.status(201).json(newOffer);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

router.put("/offer/update", isAuthenticated, fileUpload(), async (req, res) => {
  try {
    const offer = await Offer.findById(req.query.id).populate("owner");
    // const offer = await Offer.find().populate("offer");
    // console.log(req.body);
    if (!offer) {
      return res
        .status(400)
        .json({ message: "No offer corresponding to this id" });
    }
    for (key in req.body) {
      if (key.slice(0, 8) === "product_") {
        offer[key] = req.body[key];
      } else {
        offer.product_details = offer.product_details.map((detail) => {
          if (detail[key]) detail[key] = req.body[key];
          return detail;
        });
      }
    }
    offer.product_image = req.files.picture && {
      secure_url: await uploadToCloudinaryAngGetUrl(req.files.picture, {
        folder: `vinted/offers/${offer.owner._id}`,
      }),
    };
    // console.log(offer);
    offer.save();
    res.status(201).json({
      message: `Offer updated !`,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete("/offer/delete/:id", isAuthenticated, async (req, res) => {
  try {
    const offer = await Offer.findByIdAndDelete(req.params.id);
    if (!offer) {
      return res
        .status(400)
        .json({ message: "No offer corresponding to this id" });
    }
    //
    // image is not deleted from Cloudinary
    //
    res.status(201).json({
      message: `Offer deleted !`,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/offer/:id", async (req, res) => {
  try {
    const offer = await Offer.findById(req.params.id);
    if (!offer) {
      return res
        .status(400)
        .json({ message: "No offer corresponding to this id" });
    }
    offer.owner = await User.findById(offer.owner).select("account");
    res.status(201).json(offer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
