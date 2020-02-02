// const UUID = require ( 'uuid/v1' );
// const BaseComponent = require ( './component' );
// const Entity = require ( './entity' );
// const QueryCache = require ( './querycache' );

const componentMethods = new Set ( [ 'stringify', 'clone', 'getObject', Symbol.iterator ] );


EntityObject = ( object, component, reference ) => {

	const entity = component.entity;
	const ecs = component.ecs;

	return new Proxy ( object, {
		get ( obj, prop, prox ) {

			const value = Reflect.get ( obj, prop, prox );
			if ( typeof value === 'string' ) {
				return component.ecs.getEntity ( value );
			}
			return value;
		},
		set ( obj, prop, value ) {

			component.updated = component.ecs.ticks;
			const old = Reflect.get ( obj, prop );
			if ( value && value.id ) {
				value = value.id;
			}
			const result = Reflect.set ( obj, prop, value );
			ecs._sendChange ( component, 'setEntityObject', prop, old, value );
			if ( old && old !== value ) {
				ecs.deleteRef ( old, entity.id, component.id, reference, prop );
			}
			if ( value && value !== old ) {
				ecs.addRef ( value, entity.id, component.id, reference, prop );
			}
			return result;
		},

		deleteProperty ( obj, prop ) {

			const old = Reflect.get ( obj, prop );
			if ( old ) {
				ecs.deleteRef ( old, entity.id, component.id, reference, prop );
			}
			if ( prop in obj ) {
				delete obj[ prop ];
				ecs._sendChange ( component, 'deleteEntityObject', prop );
			}
		}

	} );
};

EntitySet = ( object, component, reference ) => {
	const ecs = component.ecs;
	const entity = component.entity;

	class EntitySet extends Set {

		/* $lab:coverage:off$ */

		// lab doesn't detect this being used internally
		static get [ Symbol.species ] () {
			return this.constructor;
		}

		/* $lab:coverage:on */

		add ( value ) {

			if ( value.id ) {
				value = value.id;
			}
			ecs.addRef ( value, entity.id, component.id, reference, '__set__' );
			component.updated = component.ecs.ticks;
			component.ecs._sendChange ( component, 'addEntitySet', reference, undefined, value );
			return super.add ( value );
		}

		delete ( value ) {

			if ( value.id ) {
				value = value.id;
			}
			ecs.deleteRef ( value, entity.id, component.id, reference, '__set__' );
			component.updated = component.ecs.ticks;
			component.ecs._sendChange ( component, 'deleteEntitySet', reference, undefined, value );
			return super.delete ( value );
		}

		clear () {

			component.updated = component.ecs.ticks;
			component.ecs._sendChange ( component, 'clearEntitySet', reference, undefined, undefined );
			for ( const entity of this ) {
				this.delete ( entity );
			}
		}

		has ( value ) {

			if ( value.id ) {
				value = value.id;
			}
			const has = super.has ( value );
			return has;
		}

		[ Symbol.iterator ] () {

			const that = this;
			const siterator = super[ Symbol.iterator ] ();
			return {
				next () {

					const result = siterator.next ();
					if ( typeof result.value === 'string' ) {
						result.value = component.ecs.getEntity ( result.value );
					}
					return result;
				}
			}
		}

		toJSON () {

			return [ ...this ].map ( entity => entity.id );
		}
	}

	return new EntitySet ( object );
},

ComponentSet = ( object, component, reference ) => {
	const ecs = component.ecs;
	const entity = component.entity;

	class ComonentSet extends Set {

		/* $lab:coverage:off$ */

		// lab doesn't detect this being used internally
		static get [ Symbol.species ] () {
			return this.constructor;
		}

		/* $lab:coverage:on */

		add ( value ) {

			if ( value.id ) {
				value = value.id;
			}
			component.updated = component.ecs.ticks;
			component.ecs._sendChange ( component, 'addComponentSet', reference, undefined, value );
			return super.add ( value );
		}

		delete ( value ) {

			if ( value.id ) {
				value = value.id;
			}
			component.updated = component.ecs.ticks;
			component.ecs._sendChange ( component, 'deleteComponentSet', reference, undefined, value );
			return super.delete ( value );
		}

		clear () {

			component.updated = component.ecs.ticks;
			component.ecs._sendChange ( component, 'clearComponentSet', reference, undefined, undefined );
			for ( const entity of this ) {
				this.delete ( entity );
			}
		}

		has ( value ) {

			if ( value.id ) {
				value = value.id;
			}
			const has = super.has ( value );
			return has;
		}

		[ Symbol.iterator ] () {

			const that = this;
			const siterator = super[ Symbol.iterator ] ();
			return {
				next () {

					const result = siterator.next ();
					if ( typeof result.value === 'string' ) {
						result.value = entity.componentMap[ result.value ];
					}
					return result;
				}
			}
		}

		/* $lab:coverage:off$ */
		// code coverage tool is wrong about this for some reason
		// ¯\_(ツ)_/¯
		toJSON () {

			return [ ...this ].map ( entity => entity.id );
		}

		/* $lab:coverage:on$ */
	}

	return new ComonentSet ( object );
},

ComponentObject = ( object, component ) => {
		return new Proxy ( object, {
			get: ( obj, prop, prox ) => {

				const value = Reflect.get ( obj, prop, prox );
				if ( typeof value === 'string' ) {
					return component.entity.componentMap[ value ];
				}
				return value;
			},
			set: ( obj, prop, value ) => {

				component.lastTick = component.ecs.ticks;
				const old = Reflect.get ( obj, prop );
				if ( typeof value === 'object' ) {
					const result = Reflect.set ( obj, prop, value.id );
					component.ecs._sendChange ( component, 'setComponentObject', prop, old, value.id );
					return result;
				}
				const result = Reflect.set ( obj, prop, value );
				component.ecs._sendChange ( component, 'setComponentObject', prop, old, value );
				return result;
			},
			deleteProperty ( obj, prop ) {
				if ( prop in obj ) {
					delete obj[ prop ];
					component.ecs._sendChange ( component, 'deleteComponentObject', prop );
				}
			}
		} );
	}


const CoreProperties = new Set ( [
	'ecs', 'entity', 'type', '_values', '_ready', 'id',
	'updated', 'constructor', 'stringify', 'clone', 'getObject'
] );

class BaseComponent {

	constructor ( ecs, entity, initialValues ) {

		Object.defineProperty ( this, 'ecs', { enumerable: false, value: ecs } );
		Object.defineProperty ( this, 'entity', { enumerable: true, value: entity } );
		Object.defineProperty ( this, 'type', { enumerable: false, value: this.constructor.name } );
		Object.defineProperty ( this, '_values', { enumerable: false, value: {} } );
		Object.defineProperty ( this, '_refs', { enumerable: false, value: {} } );
		Object.defineProperty ( this, '_ready', { writable: true, enumerable: false, value: false } );
		Object.defineProperty ( this, 'id', { enumerable: true, value: initialValues.id || ULID.ulid () } );
		Object.defineProperty ( this, 'updated', { enumerable: false, writable: true, value: this.ecs.ticks } );

		//loop through inheritance by way of prototypes
		//avoiding constructor->super() boilerplate for every component
		//also avoiding proxies just for a simple setter on properties
		const definitions = [];
		for ( var c = this.constructor; c !== null; c = Object.getPrototypeOf ( c ) ) {
			if ( !c.definition ) continue;
			definitions.push ( c.definition );
		}
		//we want to inherit deep prototype defintions first
		definitions.reverse ();

		for ( let idx = 0, l = definitions.length; idx < l; idx++ ) {

			const definition = definitions[ idx ];
			// set component properties from Component.properties
			if ( !definition.properties ) {
				continue;
			}
			const properties = definition.properties;
			const keys = Object.keys ( properties );
			for ( let idx = 0, l = keys.length; idx < l; idx++ ) {
				const property = keys[ idx ];
				if ( CoreProperties.has ( property ) ) {
					throw new Error ( `Cannot override property in Component definition: ${ property }` );
				}
				const value = properties[ property ];
				if ( this._values.hasOwnProperty ( property ) ) {
					this[ property ] = value;
					continue;
				}
				switch ( value ) {
					case '<EntitySet>':
						Object.defineProperty ( this, property, {
							//writable: true,
							enumerable: true,
							set: ( value ) => {
								Reflect.set ( this._values, property, ComponentRefs.EntitySet ( value, this, property ) );
							},
							get: () => {
								return Reflect.get ( this._values, property );
							}
						} );
						//this._refs[property] = this[property];
						this[ property ] = [];
						break;
					case '<EntityObject>':
						Object.defineProperty ( this, property, {
							writable: false,
							enumerable: true,
							value: ComponentRefs.EntityObject ( {}, this, property )
						} );
						this._refs[ property ] = this[ property ];
						break;
					case '<Entity>':
						Object.defineProperty ( this, property, {
							enumerable: true,
							writeable: true,
							set: ( value ) => {

								if ( value && value.id ) {
									value = value.id;
								}
								const old = Reflect.get ( this._values, property );
								if ( old && old !== value ) {
									this.ecs.deleteRef ( old, this.entity.id, this.id, property );
								}
								if ( value && value !== old ) {
									this.ecs.addRef ( value, this.entity.id, this.id, property );
								}
								const result = Reflect.set ( this._values, property, value );
								this.ecs._sendChange ( this, 'setEntity', property, old, value );
								return result;
							},
							get: () => {

								return this.ecs.getEntity ( this._values[ property ] );
							}
						} );
						this._values[ property ] = null;
						break;
					case '<ComponentObject>':
						Object.defineProperty ( this, property, {
							writable: false,
							enumerable: true,
							value: ComponentRefs.ComponentObject ( {}, this )
						} );
						this._refs[ property ] = this[ property ];
						break;
					case '<ComponentSet>':
						Object.defineProperty ( this, property, {
							//writable: true,
							enumerable: true,
							set: ( value ) => {
								Reflect.set ( this._values, property, ComponentRefs.ComponentSet ( value, this, property ) );
							},
							get: () => {
								return Reflect.get ( this._values, property );
							}
						} );
						//this._refs[property] = this[property];
						this[ property ] = [];
						break;
					case '<Component>':
						Object.defineProperty ( this, property, {
							enumerable: true,
							writeable: true,
							set: ( value ) => {

								if ( typeof value === 'object' ) {
									value = value.id;
								}
								const old = Reflect.get ( this._values, property );
								const result = Reflect.set ( this._values, property, value );
								this.ecs._sendChange ( this, 'setComponent', property, old, value );
								return result;
							},
							get: () => {

								return this.entity.componentMap[ this._values[ property ] ];
							}
						} );
						this._values[ property ] = null;
						break;
					default:
						// if ( typeof value === 'function' && value.constructor && value.constructor.length == 0 ) {
						// 	value = value.constructor ();
						// }
						let reflect = null;
						if ( typeof value === 'string' && value.startsWith ( '<Pointer ' ) ) {
							reflect = value.substring ( 9, value.length - 1 ).trim ().split ( '.' )
						}
						Object.defineProperty ( this, property, {
							enumerable: true,
							writeable: true,
							set: ( value ) => {

								const old = Reflect.get ( this._values, property, value );
								const result = Reflect.set ( this._values, property, value );
								if ( reflect ) {
									let node = this;
									let fail = false;
									for ( let i = 0; i < reflect.length - 1; i++ ) {
										const subprop = reflect[ i ];
										/* $lab:coverage:off$ */
										if ( typeof node === 'object' && node !== null && node.hasOwnProperty ( subprop ) ) {
											/* $lab:coverage:on */
											node = node[ subprop ];
										} else {
											fail = true;
										}
									}
									if ( !fail ) {
										Reflect.set ( node, reflect[ reflect.length - 1 ], value );
										node = value;
									}
								}
								this.ecs._sendChange ( this, 'set', property, old, value );
								return result;
							},
							get: () => {
								if ( !reflect ) {
									return Reflect.get ( this._values, property );
								}
								let node = this;
								let fail = false;
								for ( let i = 0; i < reflect.length - 1; i++ ) {
									const subprop = reflect[ i ];
									/* $lab:coverage:off$ */
									if ( typeof node === 'object' && node !== null && node.hasOwnProperty ( subprop ) ) {
										/* $lab:coverage:on */
										node = node[ subprop ];
									} else {
										fail = true;
									}
								}
								if ( !fail ) {
									return Reflect.get ( node, reflect[ reflect.length - 1 ] );
								} else {
									return Reflect.get ( this._values, property );
								}
							}
						} );
						this._values[ property ] = value;
						break;
				}
			}
		}

		// don't allow new properties
		Object.seal ( this );
		Object.seal ( this._values );
		const values = { ...initialValues };
		delete values.type;
		delete values.entity;
		delete values.id;
		Object.assign ( this, values );
		this.ecs._sendChange ( this, 'addComponent' );
		this._ready = true;
	}

	stringify () {

		return JSON.stringify ( this.getObject () );
	}

	getObject () {

		const serialize = this.constructor.definition.serialize;
		let values = this._values;
		if ( serialize ) {
			/* $lab:coverage:off$ */
			if ( serialize.skip ) return undefined;
			/* $lab:coverage:on$ */
			if ( serialize.ignore.length > 0 ) {
				values = {}
				const props = new Set ( [ ...serialize.ignore ] );
				for ( const prop of Object.keys ( this._values ).filter ( prop => !props.has ( prop ) ) ) {
					values[ prop ] = this._values[ prop ];
				}
			}
		}
		return Object.assign ( { id: this.id, type: this.type }, values, this._refs );
	}

}

BaseComponent.definition = {
	properties: {},
	multiset: false,
	serialize: {
		skip: false,
		ignore: [],
	}
};


class Entity {

	constructor ( ecs, definition = {} ) {

		Object.defineProperty ( this, 'ecs', { enumerable: false, value: ecs } );
		this.id = definition.id || ULID.ulid ();
		Object.defineProperty ( this, 'components', { enumerable: false, value: {} } );
		Object.defineProperty ( this, 'componentMap', { enumerable: false, value: {} } );

		this.updatedComponents = this.ecs.ticks;
		this.updatedValues = this.ecs.ticks;

		for ( const type of Object.keys ( definition ) ) {
			if ( type === 'id' ) continue;
			if ( !ecs.types.hasOwnProperty ( type ) ) throw new Error ( `No component type named "${ type }". Did you misspell it?` )
			const cdefs = definition[ type ];
			const mapBy = ecs.types[ type ].definition.mapBy;
			if ( Array.isArray ( cdefs ) ) {
				for ( const def of cdefs ) {
					this.addComponent ( type, def, true );
				}
			} else if ( mapBy ) {
				for ( const key of Object.keys ( cdefs ) ) {
					const def = cdefs[ key ];
					def[ mapBy ] = key;
					this.addComponent ( type, def, true );
				}
			} else {
				this.addComponent ( type, cdefs, true );
			}
		}
		this.ecs.entities.set ( this.id, this );
		this.ecs._updateCache ( this );
	}

	addComponent ( type, definition, delayCache ) {

		const ecs = this.ecs;
		// if ( ecs.types[ type ] == undefined ) {
		// 	ecs.registerComponentClass ( type )
		// }
		const component = new ecs.types[ type ] ( ecs, this, definition );

		let addedType = false;
		if ( ecs.types[ type ].definition.multiset ) {
			const mapBy = ecs.types[ type ].definition.mapBy;
			if ( mapBy ) {
				if ( !this.components.hasOwnProperty ( component.type ) ) {
					this.components[ component.type ] = {};
					addedType = true;
				}
				this.components[ component.type ][ component[ mapBy ] ] = component;
			} else {
				if ( !this.components.hasOwnProperty ( component.type ) ) {
					this.components[ component.type ] = new Set ( [ component ] );
					addedType = true;
				} else {
					this.components[ component.type ].add ( component );
				}
			}
		} else {
			if ( this.components.hasOwnProperty ( component.type ) ) {
				throw new Error ( `Entity<${ this.id }> already has component ${ component.type }` )
			}
			this.components[ component.type ] = component;
			addedType = true;
		}
		if ( addedType ) {
			Object.defineProperty ( this, component.type, {
				configurable: true,
				enumerable: true,
				get: () => {
					return Reflect.get ( this.components, component.type );
				}
			} );
		}

		ecs.entityComponents.get ( component.type ).add ( this.id );
		ecs.components.get ( component.type ).add ( component );


		this.updatedComponents = this.ecs.ticks;
		if ( !delayCache ) {
			this.ecs._updateCache ( this );
		}

		this.componentMap[ component.id ] = component;
		return component;
	}
	
	getComponent ( type ) {
		for ( const comp of this.components ) {
			if ( comp instanceof type ) {
				return comp;
			}
		}
	}
	
	removeComponentByType ( cname ) {

		if ( !this.components.hasOwnProperty ( cname ) ) {
			return;
		}

		if ( this.ecs.types[ cname ].definition.multiset ) {
			for ( const component of this.components[ cname ] ) {
				this.removeComponent ( component, true );
			}
			this.ecs._updateCache ( this );
		} else {
			this.removeComponent ( this.components[ cname ] );
		}
	}

	removeComponent ( component, delayCache ) {

		if ( !( component instanceof BaseComponent ) ) {
			component = this.componentMap[ component ];
		}
		const ecs = this.ecs;
		const name = component.type;
		let removedType = false;
		if ( ecs.types[ name ].definition.multiset ) {
			const mapBy = ecs.types[ name ].definition.mapBy;
			if ( mapBy ) {
				const mapValue = component[ mapBy ]
				if ( this.components.hasOwnProperty ( component.type )
					&& this.components[ component.type ].hasOwnProperty ( mapValue )
					&& this.components[ component.type ][ mapValue ].id === component.id
				) {
					delete this.components[ component.type ][ mapValue ];
					if ( Object.entries ( this.components[ component.type ] ).length === 0 ) {
						removedType = true;
					}
				} else {
					return;
				}
			} else {
				if ( this.components.hasOwnProperty ( component.type ) ) {
					const cset = this.components[ component.type ];
					cset.delete ( component );
					if ( cset.size === 0 ) {
						removedType = true;
					}
				} else {
					return;
				}
			}
		} else {
			removedType = true;
		}
		if ( removedType ) {
			ecs.entityComponents.get ( component.type ).delete ( this.id );
			delete this.components[ component.type ];
			delete this[ component.type ];
		}

		ecs.components.get ( component.type ).delete ( component );
		if ( !delayCache ) {
			this.ecs._updateCache ( this );
		}

		delete this.componentMap[ component.id ];
		this.updatedComponents = this.ecs.ticks;
	}

	getObject () {

		const result = {};
		for ( const type of Object.keys ( this.components ) ) {
			const definition = this.ecs.types[ type ].definition;
			if ( definition.serialize && definition.serialize.skip ) continue;
			let next;
			if ( this.components[ type ] instanceof Set ) {
				next = [];
				for ( const component of this.components[ type ] ) {
					next.push ( component.getObject () );
				}
			} else if ( definition.mapBy ) {
				next = {};
				for ( const key of Object.keys ( this.components[ type ] ) ) {
					next[ key ] = this.components[ type ][ key ].getObject ();
				}
			} else {
				next = this.components[ type ].getObject ();
			}
			result[ type ] = next;
		}
		return Object.assign ( { id: this.id }, result );
	}

	destroy () {

		this.ecs._clearEntityFromCache ( this );
		if ( this.ecs.refs[ this.id ] ) {
			for ( const ref of this.ecs.refs[ this.id ] ) {
				const [ entityId, componentId, prop, sub ] = ref.split ( '...' );
				const entity = this.ecs.getEntity ( entityId );
				// remove coverage because I can't think of how this would go wrng
				/* $lab:coverage:off$ */
				if ( !entity ) continue;
				const component = entity.componentMap[ componentId ];
				if ( !component ) continue;
				/* $lab:coverage:on$ */
				if ( !sub ) {
					component[ prop ] = null;
				} else if ( sub === '__set__' ) {
					component[ prop ].delete ( this );
				} else {
					component[ prop ][ sub ] = null;
				}
			}
		}
		this.ecs.entities.delete ( this.id );
	}

}


class System {

	constructor ( ecs ) {

		this.ecs = ecs;
		this.changes = [];
		this.lastTick = this.ecs.ticks;
		/* $lab:coverage:off$ */
		if ( this.constructor.query && ( this.constructor.query.has || this.constructor.query.hasnt ) ) {
			/* $lab:coverage:on$ */
			const query = { persist: this, ...this.constructor.query };
			this.ecs.queryEntities ( query );
			this.query = this.ecs.queryCache.get ( this );
		}
		if ( this.constructor.subscriptions ) {
			for ( const sub of this.constructor.subscriptions ) {
				this.ecs.subscribe ( this, sub );
			}
		}
	}

	update ( tick, entities ) {

	}

	_sendChange ( change ) {

		this.changes.push ( change );
	}

	destroy () {
	}

}


class QueryCache {

	constructor ( ecs, has, hasnt ) {

		this.ecs = ecs;
		this.has = has;
		this.hasnt = hasnt;
		this.results = this._initial ();
	}

	_initial () {

		if ( this.has.length === 1 && this.hasnt.length === 0 ) {
			const entities = new Set ();
			for ( const component of this.ecs.getComponents ( this.has[ 0 ] ) ) {
				entities.add ( component.entity );
			}
			return entities;
		}
		const hasSet = [];
		const hasntSet = [];
		for ( const cname of this.has ) {
			hasSet.push ( this.ecs.entityComponents.get ( cname ) );
		}
		hasSet.sort ( ( a, b ) => {
			return a.size - b.size;
		} );
		for ( const cname of this.hasnt ) {
			hasntSet.push ( this.ecs.entityComponents.get ( cname ) );
		}

		let results = undefined;
		if ( hasSet[ 0 ] != undefined ) {
			results = new Set ( [ ...hasSet[ 0 ] ] );
		} else {
			results = new Set ();
		}

		for ( let idx = 1, l = hasSet.length; idx < l; idx++ ) {
			const intersect = hasSet[ idx ];
			for ( const id of results ) {
				if ( !intersect.has ( id ) ) {
					results.delete ( id );
				}
			}
		}
		for ( const id of results ) {
			for ( const diff of hasntSet ) {
				if ( diff.has ( id ) ) {
					results.delete ( id );
					break;
				}
			}
		}

		return new Set ( [ ...results ]
			.map ( id => this.ecs.entities.get ( id ) )
			.filter ( entity => !!entity )
		);
	}

	updateEntity ( entity ) {

		const id = entity.id;
		let found = true;
		for ( const cname of this.has ) {
			const hasSet = this.ecs.entityComponents.get ( cname );
			if ( !hasSet.has ( id ) ) {
				found = false;
				break;
			}
		}
		if ( !found ) {
			this.results.delete ( entity );
			return;
		}

		found = false;
		for ( const cname of this.hasnt ) {
			const hasntSet = this.ecs.entityComponents.get ( cname );
			if ( hasntSet.has ( id ) ) {
				found = true;
				break;
			}
		}
		if ( found ) {
			this.results.delete ( entity );
			return;
		}
		this.results.add ( entity );
	}

	clearEntity ( entity ) {

		this.results.delete ( entity );
	}

	filter ( updatedValues, updatedComponents ) {

		let output;
		if ( updatedValues > 0 ) {
			output = [];
			for ( const entity of this.results ) {
				if ( entity.updatedValues >= updatedValues ) output.push ( entity );
			}
		} else if ( updatedComponents > 0 ) {
			output = [];
			for ( const entity of this.results ) {
				if ( entity.updatedComponents >= updatedComponents ) output.push ( entity );
			}
		} else {
			return this.results;
		}

		return new Set ( output );
	}
}


class ECS {

	constructor () {
		this.ticks = 0;
		this.entities = new Map ();
		this.types = {};
		this.entityComponents = new Map ();
		this.components = new Map ();
		this.queryCache = new Map ();
		this.subscriptions = new Map ();
		this.systems = new Map ();
		this.refs = {};
	}

	tick () {
		this.ticks++;
		return this.ticks;
	}

	addRef ( target, entity, component, prop, sub ) {
		if ( !this.refs[ target ] ) {
			this.refs[ target ] = new Set ();
		}
		this.refs[ target ].add ( [ entity, component, prop, sub ].join ( '...' ) );
	}

	deleteRef ( target, entity, component, prop, sub ) {
		/* $lab:coverage:off$ */
		if ( !this.refs[ target ] ) return;
		/* $lab:coverage:on$ */
		this.refs[ target ].delete ( [ entity, component, prop, sub ].join ( '...' ) );
		if ( this.refs[ target ].size === 0 ) {
			delete this.refs[ target ];
		}
	}

	registerComponent ( name, definition = {} ) {

		const klass = class Component extends BaseComponent {
		}
		klass.definition = definition;
		Object.defineProperty ( klass, 'name', { value: name } );
		this.registerComponentClass ( klass );
		return klass;
	}

	registerComponentClass ( klass ) {

		this.types[ klass.name ] = klass;
		this.entityComponents.set ( klass.name, new Set () );
		this.components.set ( klass.name, new Set () );
	}
	
	findComponentClass ( name ) {
		return this.types[ name ];
	}

	createEntity ( definition ) {

		return new Entity ( this, definition );
	}

	removeEntity ( id ) {

		let entity;
		if ( id instanceof Entity ) {
			entity = id;
			id = entity.id;
		} else {
			entity = this.getEntity ( id );
		}
		entity.destroy ();
	}

	getEntity ( entityId ) {

		return this.entities.get ( `${ entityId }` );
	}

	queryEntities ( args ) {

		const { has, hasnt, persist, updatedValues, updatedComponents } = Object.assign ( {
			has: [],
			hasnt: [],
			persist: false,
			updatedValues: 0,
			updatedComponents: 0
		}, args );

		let query;
		if ( persist ) {
			query = this.queryCache.get ( persist );
		}
		if ( !query ) {
			query = new QueryCache ( this, has, hasnt );
		}
		if ( persist ) {
			this.queryCache.set ( persist, query );
		}
		return query.filter ( updatedValues, updatedComponents );
	}

	getComponents ( name ) {

		return this.components.get ( name );
	}

	subscribe ( system, type ) {

		if ( !this.subscriptions.has ( type ) ) {
			this.subscriptions.set ( type, new Set () );
		}
		this.subscriptions.get ( type ).add ( system );
	}

	addSystem ( group, system ) {

		if ( typeof system === 'function' ) {
			system = new system ( this );
		}
		if ( !this.systems.has ( group ) ) {
			this.systems.set ( group, new Set () );
		}
		this.systems.get ( group ).add ( system );
	}

	runSystemGroup ( group ) {

		const systems = this.systems.get ( group );
		if ( !systems ) return;
		for ( const system of systems ) {
			let entities;
			if ( this.queryCache.has ( system ) ) {
				entities = this.queryCache.get ( system ).filter ();
			}
			system.update ( this.ticks, entities );
			system.lastTick = this.ticks;
			if ( system.changes.length !== 0 ) {
				system.changes = [];
			}
		}
	}

	tickAllSystem () {
		for ( const group of this.systems.keys () ) {
			const systems = this.systems.get ( group );
			if ( !systems ) continue;
			for ( const system of systems ) {
				let entities;
				if ( this.queryCache.has ( system ) ) {
					entities = this.queryCache.get ( system ).filter ();
				}
				system.update ( this.ticks, entities );
				system.lastTick = this.ticks;
				if ( system.changes.length !== 0 ) {
					system.changes = [];
				}
			}
		}
	}

	_clearEntityFromCache ( entity ) {

		for ( const query of this.queryCache ) {
			query[ 1 ].clearEntity ( entity );
		}

	}

	_updateCache ( entity ) {

		for ( const query of this.queryCache ) {
			query[ 1 ].updateEntity ( entity );
		}
	}

	_sendChange ( component, op, key, old, value ) {

		if ( !component._ready ) return;
		component.updated = component.entity.updatedValues = this.ticks;
		const systems = this.subscriptions.get ( component.type );
		if ( systems ) {
			const change = { component, op, key, old, value };
			for ( const system of systems ) {
				system._sendChange ( change );
			}
		}
	}

}

ECS.GROUP_Input = 'input';
ECS.GROUP_Action = 'action';
ECS.GROUP_Render = 'render';
ECS.GROUP_Other = 'other';

/**
 * Game loop update patch.
 *
 */
// let alias_SceneManager_update = SceneManager.prototype.update;
// SceneManager.update = function () {
// 	try {
// 		this.tickStart ();
// 		if ( Utils.isMobileSafari () ) {
// 			this.updateInputData ();
// 		}
// 		this.updateManagers ();
// 		if ( this._ecs ) {
// 			this._ecs.tick ();
// 			this._ecs.tickAllSystem ();
// 		}
// 		this.updateMain ();
// 		this.tickEnd ();
// 	} catch ( e ) {
// 		this.catchException ( e );
// 	}
// };

// module.exports = ECS;
