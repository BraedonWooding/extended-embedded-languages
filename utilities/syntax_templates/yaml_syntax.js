/**
 * Build the syntax definition for YAML as a host language
 * @param {HostSpec} hostSpec - Specification for the host language
 * @param {EmbeddedSpec[]} embeddedSpecs - Array of data about each
 * embedded language
 * @returns {json} - Json object containing a TextMate language
 * injection
 */
export function buildYamlSyntax(hostSpec, embeddedSpecs) {
    const syntax = {
        '$schema': 'https://raw.githubusercontent.com/martinring/tmlanguage/master/tmlanguage.json',
        'injectionSelector': 'L:source.yaml -string -comment',
        'scopeName': `${hostSpec.embedded_scope}`,
        'patterns': [{'include': '#block-scalar-with-embedding'}],
        'repository': {
            'block-scalar-with-embedding': {
                'comment': 'These patterns all match YAML block scalar strings and select one language.' +
                    'The syntax is injected into https://github.com/microsoft/vscode/blob/main/extensions/yaml/syntaxes/yaml.tmLanguage.json',
                'patterns': [],
            },
        },
    };
    embeddedSpecs.forEach(function(lang) {
        syntax.repository['block-scalar-with-embedding'].patterns.push(
                {
                    'comment': `${lang.name}-formatted block scalar strings`,
                    'name': 'string.quoted.multi.embedded.yaml',
                    'begin': `(?:(\\|)|(>))([1-9])?([-+])?\\s*(#(?i:${hostSpec.id_choice_re}))\\b\\s*\\n?`,
                    'beginCaptures': {
                        '1': {'name': 'keyword.control.flow.block-scalar.literal.yaml'},
                        '2': {'name': 'keyword.control.flow.block-scalar.folded.yaml'},
                        '3': {'name': 'constant.numeric.indentation-indicator.yaml'},
                        '4': {'name': 'storage.modifier.chomping-indicator.yaml'},
                        '5': {'name': `meta.encoding.yaml`},
                    },
                    'end': '^(?=\\S)|(?!\\G)',
                    'patterns': [
                        {
                            'begin': '^([ ]+)(?! )',
                            'end': '^(?!\\1|\\s*$)',
                            'patterns': [{'include': `${lang.root_scope}`}],
                            'name': `meta.embedded.string.raw.${lang.vsname}.yaml`,
                        },
                    ],
                }
        );
    });

    return syntax;
}
