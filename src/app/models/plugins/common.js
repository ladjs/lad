
import jsonSelect from 'mongoose-json-select';
import beautifulValidation from 'mongoose-beautiful-unique-validation';

export default function CommonPlugin(object) {

  return function Plugin(Schema) {

    Schema.add({
      id: {
        type: String,
        required: true,
        index: true,
        unique: true
      },
      created_at: {
        type: Date,
        required: true
      },
      updated_at: {
        type: Date,
        required: true
      },
      object: {
        type: String,
        required: true,
        trim: true,
        lowercase: true
      }
    });

    Schema.pre('validate', function (next) {
      this.object = object;
      this.created_at = this._id.getTimestamp();
      this.updated_at = Date.now();
      this.id = this._id.toString();
      next();
    });

    Schema.plugin(jsonSelect, '-_id -__v');
    Schema.plugin(beautifulValidation);

    return Schema;

  };

}
