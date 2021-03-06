const auth = require('../middleware/auth');
const Activity = require('../models/activity');
const multer = require('multer');
const logger = require('../config/logger');
const {
  ensurePicAndWriteToDisk,
  removeExistingPicFile
} = require('../services');

const upload = multer();
const {RESOURCES_DIR} = process.env;

const reflectFilePromise = (promise, file) => (
  promise.then(picUrl => ({
    resolved: true,
    rejected: false,
    value: picUrl,
    originalFileName: file.originalname
  })).catch(e => ({
    resolved: false,
    rejected: true,
    reason: e,
    originalFileName: file.originalname
  }))
);

const activityRoutes = app => {
  app.put('/api/activity', auth, upload.array('pics'), (req, res) => {
    const {name, description} = req.body;

    if (!name || !description) {
      return res.status(400).send();
    }

    const files = req.files;

    if (!files || files.length === 0) {
      return res.status(400).send();
    }

    Promise
      .all(files.map(file => {
        const fileWritePromise = ensurePicAndWriteToDisk(file, RESOURCES_DIR + '/activities');
        return reflectFilePromise(fileWritePromise, file);
      }))
      .then(result => {
        const resolvedPromises = result.filter(p => p.resolved);
        if (resolvedPromises.length === 0) throw new Error('Nothing could be saved');
        const rejectedPromises = result.filter(p => p.rejected);
        const savedPicUrls = resolvedPromises.map(p => p.value.replace(RESOURCES_DIR, ''));
        const nonPicFileNames = rejectedPromises.map(p => p.originalFileName);
        return {
          savedPicUrls,
          nonPicFileNames
        };
      })
      .then(({savedPicUrls, nonPicFileNames}) => {
        return new Activity({
          name,
          description,
          pics: savedPicUrls.map(url => ({url}))
        }).save().then(activity => ({activity, nonPicFileNames}));
      })
      .then(({activity, nonPicFileNames}) => {
        res.send({
          activity,
          nonPicFileNames
        });
      })
      .catch(e => {
        logger.error(e.message, e);
        res.status(400).send();
      });
  });

  app.put('/api/activity/pic/:_id', auth, upload.single('pic'), (req, res) => {
    if (!req.file) return res.status(400).send();

    const _id = req.params._id;
    const file = req.file;

    Activity.findById(_id)
      .then(activity => {
        if (!activity) throw new Error('Could not find activity.');
        return ensurePicAndWriteToDisk(file, RESOURCES_DIR + '/activities')
          .then(picPath => ({activity, picPath}));
      })
      .then(({activity, picPath}) => {
        const picUrl = picPath.replace(RESOURCES_DIR, '');
        activity.pics.push({url: picUrl});
        return activity.save().then(() => activity.pics[activity.pics.length - 1]);
      })
      .then(pic => {
        res.send(pic);
      })
      .catch(e => {
        logger.error(e.message, e);
        res.status(400).send();
      });
  });


  app.patch('/api/activity/:_id', auth, (req, res) => {
    const {name, description} = req.body;
    const _id = req.params._id;
    if (!name || !description) {
      return res.status(400).send();
    }

    Activity.update({_id}, {
      $set: {
        name,
        description
      }
    }, {
      runValidators: true
    }).then(() => {
      res.status(200).send();
    });
  });

  app.patch('/api/activity/pic/:_id', auth, upload.single('pic'), (req, res) => {
    if (!req.file) return res.status(400).send();

    const _id = req.params._id;
    const file = req.file;

    Activity.findOne({'pics._id': _id})
      .then(a => {
        if (!a) throw new Error('Could not find activity pic.');
        return ensurePicAndWriteToDisk(file, RESOURCES_DIR + '/activities');
      })
      .then(picPath => {
        const picUrl = picPath.replace(RESOURCES_DIR, '');
        return Activity.update({
          'pics._id': _id
        }, {
          $set: {
            'pics.$.url': picUrl
          }
        }, {
          runValidators: true
        }).then(() => picUrl);
      })
      .then(picUrl => {
        res.send({url: picUrl});
      })
      .catch(e => {
        logger.error(e.message, e);
        res.status(400).send();
      });
  });

  app.delete('/api/activity/:_id', auth, (req, res) => {
    const _id = req.params._id;

    Activity.findById(_id).then(activity => {
      if (!activity) throw new Error('Could not find activity.');
      const activityPicIds = activity.pics.map(picObj => picObj._id);
      return Promise.all(activityPicIds.map(_id => {
        return removeExistingPicFile(Activity, 'pics', _id);
      }));
    }).then(() => {
      return Activity.remove({_id});
    }).then(() => {
      res.status(200).send();
    }).catch(e => {
      logger.error(e.message, e);
      res.status(400).send();
    });
  });

  app.delete('/api/activity/pic/:_id', auth, (req, res) => {
    const _id = req.params._id;

    Activity.findOne({
      'pics._id': _id
    }).then(a => {
      if (!a) throw new Error('Could not find activity pic.');
      if (a.pics.length === 1) throw new Error('Only one pic remaining. Cannot delete it.');
      return removeExistingPicFile(Activity, 'pics', _id);
    }).then(() => {
      return Activity.update({'pics._id': _id}, {
        $pull: {
          pics: {_id}
        }
      });
    }).then(() => {
      res.status(200).send();
    }).catch(e => {
      logger.error(e.message, e);
      res.status(400).send();
    });
  });
};

module.exports = activityRoutes;
