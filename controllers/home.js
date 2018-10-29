/**
 * GET /
 * Home page.
 */
exports.index = function(req, res) {
  res.render('home', {
    title: 'Home',
    env: process.env.NODE_ENV,
    user: req.user || 'anonymous'
  });
};
