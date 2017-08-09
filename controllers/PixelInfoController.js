const Pixel = require('../models/pixel');


const things = [
    {
        img_url: 'https://i.loli.net/2017/08/09/598a9011c1f3c.png',
        img_desc: 'microsoft',
        img_pos: [20, 20, 50, 50],
        img_detail_url: 'https://www.microsoft.com/',
        confidence: 0.8523550916,
    },
    {
        img_url: 'https://i.loli.net/2017/08/09/598a9011c1f3c.png',
        img_desc: 'microsoft',
        img_pos: [60, 80, 220, 250],
        img_detail_url: 'https://www.microsoft.com/',
        confidence: 0.9124324456,
    },
];

exports.getAPIPixelInfo = (req, res, next) => {
    function fail(err) {
        req.place.reportError('Pixel data retrieve error: ' + err);
        return res.status(500).json({
            success: false,
            error: {
                message:
            'An error occurred while trying to look up information about that pixel.'
            }
        });
    }
    if (!req.query.x || !req.query.y) {
        return res.status(400).json({
            success: false,
            error: {
                message: 'You did not specify the coordinates of the pixel to look up.',
                code: 'bad_request'
            }
        });
    }
    var overrideDataAccess = req.user && (req.user.moderator || req.user.admin);
    Pixel.find({xPos: req.query.x, yPos: req.query.y})
        .then((pixels) => {
            if (pixels.length <= 0) return res.json({success: true, pixel: null});
            pixels[0]
                .getInfo(overrideDataAccess, req.place)
                .then((info) => {res.json({
                    success: true, 
                    pixel: info,
                    things: things.filter((t) => {
                        const p = t.img_pos;
                        return p[0] <= req.query.x && p[1] <= req.query.y && p[2] >= req.query.x && p[3] >= req.query.y;
                    }),
                })})
                .catch((err) => fail(err));
        })
        .catch((err) => fail(err));
};
