const express = require("express");
const mongoose = require("mongoose");
const { ensureAuth } = require("../middlewares/auth");
const router = express.Router();
const Story = require('../models/Story')


//@desc Show ADD story
//@route GET /stories/add
router.get('/add', ensureAuth, (req, res) => {
    res.render("stories/add")
})


//@desc process add page
//@route POST /stories
router.post('/', ensureAuth, async (req, res) => {
    try {
        req.body.user = req.user.id;
        await Story.create(req.body);
        res.redirect('/');
        console.log(req.body);
    } catch (error) {
        console.error(error)
        res.render('error/500')
    }
})


//@desc Show all stories
//@route GET /stories
router.get('/', ensureAuth, async (req, res) => {
    try {
        const stories = await Story.find({ status: 'public' })
            .populate('user')
            .sort({ createdAt: 'desc' })
            .lean()
        res.render('stories/index', {
            stories
        })
    } catch (error) {
        console.error(error)
        res.render('error/500')
    }
})


//@desc Show a user stories
//@route GET /stories/user/:userid
router.get('/user/:userId', ensureAuth, async (req, res) => {
    try {
        const stories = await Story.find({ user: req.params.userId, status: 'public' })
            .populate('user')
            .sort({ createdAt: 'desc' })
            .lean()
        res.render('stories/index', {
            stories
        })
    } catch (error) {
        console.error(error)
        res.render('error/500')
    }
})


//@desc Show single story
//@route GET /stories/:id
router.get('/:id', ensureAuth, async (req, res) => {
    try {
        let story = await Story.findById({ _id: req.params.id }).populate('user').lean()
        if (!story) {
            return res.render('/error/404')
        }
        res.render('stories/show', {
            story,
        })
    } catch (error) {
        console.error(error)
    }
})


//@desc Show EDIT story
//@route GET /stories/edit/:id
router.get('/edit/:id', ensureAuth, async (req, res) => {
    try {
        const story = await Story.findOne({ _id: req.params.id }).lean()

        if (!story) {
            res.render('error/404')
        }

        if (story.user != req.user.id) {
            res.redirect('/stories')
        } else {
            res.render('stories/edit', {
                story,
            })
        }
    } catch (error) {
        console.error(err)
        return res.render('error/500')
    }

})


//@desc Update story
//@route PUT /stories/:id
router.put('/:id', ensureAuth, async (req, res) => {
    try {
        let story = await Story.findById(req.params.id).lean()

        if (!story) {
            return res.render('error/404')
        }

        if (story.user != req.user.id) {
            res.redirect('/stories')
        } else {
            story = await Story.findOneAndUpdate({ _id: req.params.id }, req.body, {
                new: true,
                runValidators: true,
            })

            res.redirect('/dashboard')
        }
    } catch (err) {
        console.error(err)
        return res.render('error/500')
    }
})



//@desc Delete story
//@route delete /stories/:id
router.delete('/:id', ensureAuth, async (req, res) => {
    try {
        await Story.findByIdAndDelete({ _id: req.params.id })
        res.redirect('/dashboard')
    } catch (err) {
        console.error(err)
        return res.render('error/500')
    }
})



module.exports = router;