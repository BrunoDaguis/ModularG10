if ( CKEDITOR.env.ie && CKEDITOR.env.version < 9 )
	CKEDITOR.tools.enableHtml5Elements( document );

CKEDITOR.config.height = 450;
CKEDITOR.config.width = 'auto';
CKEDITOR.config.htmlEncodeOutput = false;
CKEDITOR.config.entities = false;
CKEDITOR.config.entities_processNumerical = 'force'; 

var initSample = ( function() {
	var wysiwygareaAvailable = isWysiwygareaAvailable(),
		isBBCodeBuiltIn = !!CKEDITOR.plugins.get( 'bbcode' );

	return function (value) {
		var editorElement = CKEDITOR.document.getById( 'editor' );

		if ( isBBCodeBuiltIn ) {
		    editorElement.setHtml(value);
		}

		if ( wysiwygareaAvailable ) {
			CKEDITOR.replace( 'editor' );
		} else {
			editorElement.setAttribute( 'contenteditable', 'true' );
			CKEDITOR.inline( 'editor' );

			// TODO we can consider displaying some info box that
		    // without wysiwygarea the classic editor may not work.
		    
		}

		CKEDITOR.instances.editor.setData(value);
	};

	function isWysiwygareaAvailable() {
		// If in development mode, then the wysiwygarea must be available.
		// Split REV into two strings so builder does not replace it :D.
		if ( CKEDITOR.revision == ( '%RE' + 'V%' ) ) {
			return true;
		}

		return !!CKEDITOR.plugins.get( 'wysiwygarea' );
	}
} )();

