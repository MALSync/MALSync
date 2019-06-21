require 'json'
require 'set'
require 'digest/sha2'

$locales = {
  'ar' => 'Arabic',
  'am' => 'Amharic',
  'bg' => 'Bulgarian',
  'bn' => 'Bengali',
  'ca' => 'Catalan',
  'cs' => 'Czech',
  'da' => 'Danish',
  'de' => 'German',
  'el' => 'Greek',
  'en' => 'English',
  'en_GB' => 'English (Great Britain)',
  'en_US' => 'English (USA)',
  'es' => 'Spanish',
  'es_419' => 'Spanish (Latin America)',
  'et' => 'Estonian',
  'fa' => 'Persian',
  'fi' => 'Finnish',
  'fil' => 'Filipino',
  'fr' => 'French',
  'gu' => 'Gujarati',
  'he' => 'Hebrew',
  'hi' => 'Hindi',
  'hr' => 'Croatian',
  'hu' => 'Hungarian',
  'id' => 'Indonesian',
  'it' => 'Italian',
  'ja' => 'Japanese',
  'kn' => 'Kannada',
  'ko' => 'Korean',
  'lt' => 'Lithuanian',
  'lv' => 'Latvian',
  'ml' => 'Malayalam',
  'mr' => 'Marathi',
  'ms' => 'Malay',
  'nl' => 'Dutch',
  'nb' => 'Norwegian',
  'no' => 'Norwegian',
  'pl' => 'Polish',
  'pt_PT' => 'Portuguese (Portugal)',
  'pt_BR' => 'Portuguese (Brazil)',
  'ro' => 'Romanian',
  'ru' => 'Russian',
  'sk' => 'Slovak',
  'sl' => 'Slovenian',
  'sr' => 'Serbian',
  'sv' => 'Swedish',
  'sw' => 'Swahili',
  'ta' => 'Tamil',
  'te' => 'Telugu',
  'th' => 'Thai',
  'tr' => 'Turkish',
  'uk' => 'Ukrainian',
  'vi' => 'Vietnamese',
  'zh_CN' => 'Chinese (China)',
  'zh_TW' => 'Chinese (Taiwan)'
}

def locales_path
  path = 'assets/_locales'
  raise 'LOCALES_PATH is not defined.' if path.nil?
  path
end

def messages_file(locale)
  root = `git rev-parse --show-toplevel`.strip
  File.join(root, locales_path, locale, 'messages.json')
end

def message_ordinals(locale, commits)
  json = load_messages(locale)
  return {} if json.nil?

  file = messages_file(locale)
  lines = `git blame -c #{file}`.lines

  keys = json.keys
  current_key = keys.shift

  current_message_id = nil
  ordinals = {}
  lines.each do |line|
    if current_key && (line =~ /^(.*?)\s+\(.*?\)\s+\"(#{current_key})\":.*/)
      current_message_id = current_key.strip
      current_key = keys.shift
    elsif current_message_id && (line =~ /^(.*?)\s+\(.*?\)\s+\"message\":/)
      commit = $1.strip.slice(0, 7)
      ordinals[current_message_id] = commits.index(commit)
      current_message_id = nil
    end
  end

  ordinals
end

def load_messages(locale)
  file = messages_file(locale)
  return nil if !File.exist?(file)
  JSON.parse(File.read(file))
end

def commits_by_age
  `git log --pretty=%h`.lines.map(&:strip).select { |line| !line.empty? }.reverse
end

def locale_status
  status = {}
  commits = commits_by_age

  en_messages = load_messages('en')
  en_ordinals = message_ordinals('en', commits)

  id_to_index = en_messages.keys.zip((0..en_messages.keys.length).to_a).to_h
  index_to_id = id_to_index.invert

  $locales.each do |locale, name|
    next if ['en_GB', 'en_US'].include?(locale)

    ordinals = message_ordinals(locale, commits)
    messages = load_messages(locale)

    exists = !messages.nil?
    if !exists
      status[locale] = {
        name: $locales[locale],
        exists: false
      }
      next
    end

    messages ||= {}

    outdated = messages.select { |id, _|
      ordinals[id] < (en_ordinals[id] || 0)
    }.map { |e|
      id_to_index[e.first]
    }

    identical = en_messages.merge(messages) { |_, l, r|
      l['message'] == r['message']
    }.select { |_, v|
      v.is_a?(TrueClass)
    }.keys.map { |e|
      id_to_index[e]
    }

    message_array = !exists ? [] : index_to_id.map do |index, id|
      (messages[id] || {})['message']
    end

    missing = message_array.each_with_index.map { |message, i| message.nil? ? i : nil }.compact

    status[locale] = {
      name: $locales[locale],
      exists: exists,
      missing: missing,
      outdated: outdated,
      identical: identical,
      messages: message_array
    }
  end

  [:outdated, :identical].each { |key| status['en'].delete(key) }

  status
end

def messages_template
  entries = load_messages('en')
  entries.each do |id, entry|
    entry.delete('message')
  end
  entries.map do |id, entry|
    { 'id' => id }.merge(entry)
  end
end

def repo_info
  remote = `git config --get branch.master.remote`.strip
  url = `git config --get "remote.#{remote}.url"`.strip
  project = File.basename(url, '.git')
  user = File.basename(File.dirname(url)).split(':').last
  return "lolamtisch", "MALSync"
end

locales = locale_status()
template = messages_template()
user, project = repo_info()

payload = {
  user: user,
  project: project,
  path: locales_path,
  locales: locales,
  template: template
}

content = JSON.dump(payload)

puts JSON.dump({
  hash: Digest::SHA2.hexdigest(content),
  **payload
})
