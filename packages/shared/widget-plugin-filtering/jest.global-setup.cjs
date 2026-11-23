// Pin a timezone with daylight saving time so date arithmetic bugs show up regardless of the host timezone.
module.exports = () => {
    process.env.TZ = "Europe/Amsterdam";
};
