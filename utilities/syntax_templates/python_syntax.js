/**
 * Build the syntax definition for Python as a host language
 * @param {HostSpec} hostSpec - Specification for the host language
 * @param {EmbeddedSpec[]} embeddedSpecs - Array of data about each
 * embedded language
 * @returns {json} - Json object containing a TextMate language
 * injection
 */
export function buildPythonSyntax(hostSpec, embeddedSpecs) {
    const syntax = {
        '$schema': 'https://raw.githubusercontent.com/martinring/tmlanguage/master/tmlanguage.json',

        // We should be able to use a more specific injection selector
        // here. See this bug report for a description of how they work:
        // https://github.com/microsoft/vscode/issues/161177
        // Ideally we would inject new behavior into how the _content_
        // of the string.quoted.multi.python spans get parsed.
        // I haven't been able to get this to work in practice though,
        // it appears that the patterns then overrun the previously
        // found 'end' tag - similar to an issue described on this page:
        // https://www.apeth.com/nonblog/stories/textmatebundle.html
        'injectionSelector': 'L:source.python -string -comment',
        'scopeName': `${hostSpec.embedded_scope}`,
        'patterns': [{'include': '#triple_quoted_strings'}],
        'repository': {
            'triple_quoted_strings': {
                'comment': 'These patterns all match Python triple-quoted strings and select one language.' +
                    'The syntax is injected into https://github.com/microsoft/vscode/blob/main/extensions/python/syntaxes/MagicPython.tmLanguage.json',
                'patterns': [],
            },
        },
    };
    embeddedSpecs.forEach((lang) => {
        if (lang.comments.length == 0) {
            return;
        }

        syntax.repository.triple_quoted_strings.patterns.push(
                {
                    'comment': `${lang.name}-formatted triple-quoted strings`,
                    'name': 'string.quoted.multi.embedded.python',
                    'begin': String.raw`(\b[uU]|[rR][fF]?|[fF][rR]?)?('''|""")(?=(?i:${hostSpec.comment_choice_re})\b)`,
                    'end': String.raw`(\2)`,
                    'contentName': `meta.embedded.string.raw.${lang.vsname}.python`,
                    'patterns': [{'include': `${lang.root_scope}`}],
                    'beginCaptures': {
                        '1': {'name': 'storage.type.string.python'},
                        '2': {'name': 'punctuation.definition.string.begin.python'},
                    },
                    'endCaptures': {
                        '1': {'name': 'punctuation.definition.string.end.python'},
                    },
                }
        );
    });

    return syntax;
}
