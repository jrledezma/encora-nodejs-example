export const content = `

<!DOCTYPE html>
<html
	lang="en"
	xmlns="https://www.w3.org/1999/xhtml"
	xmlns:o="urn:schemas-microsoft-com:office:office"
>
	<head>
		<meta charset="UTF-8" />
		<meta name="viewport" content="width=device-width,initial-scale=1" />
		<meta name="x-apple-disable-message-reformatting" />
		<title></title>
		<!--[if mso]>
			<noscript>
				<xml>
					<o:OfficeDocumentSettings>
						<o:PixelsPerInch>96</o:PixelsPerInch>
					</o:OfficeDocumentSettings>
				</xml>
			</noscript>
		<![endif]-->
		<style>
			body {
				background-color: #f1f1f0 !important;
				color: #474747 !important;
        font-size: 18px;
				font-family: Arial, sans-serif;
			}
			table {
				width: 96% !important;
        margin: auto !important;
				border-collapse: separate;
			}
		</style>
	</head>
	<body style="margin: 0; padding: 0">
		<table role="presentation" style="border-spacing: 0">
			<tr>
				<td align="center" style="padding: 0; width: 100% !important;
        background-color: #f9f9f9 !important;">
					<h1>
						<img
							src="https://absque-public-stuff.s3.amazonaws.com/clifoll_app_logo.png"
							style="
								max-width: 60px !important;
								text-align: left;
								margin-bottom: 0;
								vertical-align: middle;
							"
						/>&nbsp;Nueva Invitación Rebida
					</h1>
				</td>
			</tr>
			<tr>
				<td style="width: 100%; padding: 0.35rem !important">
					<h6
						style="font-size: 20px !important; margin-bottom: 10px !important"
					>
						¡Hola {{userFirstName}}!
					</h6>
				</td>
			</tr>
			<tr>
				<td style="width: 100%; padding: 0.35rem !important">
					<p>
						Te informamos que {{invitedByFullName}} te ha agregado como interesado en una <span style="font-style: italic">Nota</span> de sus clientes.
					</p>
					<p style="margin-bottom: 15px;"
					>
						En este 
						<a
							style="
								color: #fc6625;
								font-style: italic;
								text-decoration: none;
								cursor: pointer;
							"
							href="{{invitationDetailURL}}"
							target="_blank"
							>enlace</a
						>
						podrás observar el detalle de esta invitación.
					</p>
				</td>
			</tr>
			<tr>
				<td
					style="
						width: 100%;
						padding: 0.35rem !important;
						background-color: #e9e9e9 !important;
						color: #8f9491 !important;
					"
				>
					<p
						style="
							margin-top: 18px;
							width: 100%;
							text-align: center;
							color: #999999;
							margin-bottom: 0;
						"
					>
						<small>Creado por</small>
					</p>
					<div
						style="
							width: 50%;
							width: 100% !important;
							text-align: center !important;
							vertical-align: middle !important;
							margin-top: 0;
							margin-bottom: 0;
						"
					>
						<a
							class="cursor-pointer"
							href="https://www.absquesoft.com"
							target="_blank"
						>
							<img
								src="https://absque-public-stuff.s3.amazonaws.com/ABSQUESOFT-LOGO-transparent-footer.png"
								style="width: 225px"
								alt=""
							/>
						</a>
					</div>
				</td>
			</tr>
		</table>
	</body>
</html>
`;
