const setuidOnNodeEnvProduction = () => {
	if (process.env.NODE_ENV === 'production') {

		try {
			console.log('Old User ID: ' + process.getuid() + ', Old Group ID: ' + process.getgid())
			process.setgroups(['www-data'])
			process.setgid('www-data')
			process.setuid('www-data')
			console.log('New User ID: ' + process.getuid() + ', New Group ID: ' + process.getgid())
		} catch (err) {
			console.log('Cowardly refusing to keep the process alive as root. Please run as: www-data:www-data')
			process.exit(1) 
		}

	}
}

module.exports = setuidOnNodeEnvProduction